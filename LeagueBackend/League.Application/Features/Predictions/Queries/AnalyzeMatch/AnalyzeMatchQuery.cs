using League.Application.Common.Interfaces;
using League.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text;
using League.Application.Features.Predictions.Queries.AnalyzeMatch;

namespace League.Application.Features.Predictions.Queries.AnalyzeMatch
{
    // DTO de respuesta
    public record MatchAnalysisDto(string AnalysisText, string Probabilities, string PredictedScore);

    // El comando recibe el ID del partido a analizar
    public record AnalyzeMatchQuery(Guid MatchId) : IRequest<MatchAnalysisDto>;

    public class AnalyzeMatchQueryHandler : IRequestHandler<AnalyzeMatchQuery, MatchAnalysisDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IAIService _aiService;

        public AnalyzeMatchQueryHandler(IApplicationDbContext context, IAIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        public async Task<MatchAnalysisDto> Handle(AnalyzeMatchQuery request, CancellationToken cancellationToken)
        {
            // 1. Obtener datos del partido y los equipos
            var match = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Tournament)
                .FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);

            if (match == null) throw new Exception("Partido no encontrado");

            // 2. Calcular estadísticas RAPIDAS (Puntos y Goles) de ambos equipos en este torneo
            // (Esto le da "cerebro" a la predicción)
            var homeStats = await GetTeamStats(match.HomeTeamId, match.TournamentId, cancellationToken);
            var awayStats = await GetTeamStats(match.AwayTeamId, match.TournamentId, cancellationToken);

            // 3. Construir el Prompt para Gemini
            var sb = new StringBuilder();
            sb.AppendLine("Actúa como un analista de fútbol experto y estadístico.");
            sb.AppendLine("Analiza el siguiente enfrentamiento y genera una predicción basada en los datos proporcionados.");

            sb.AppendLine($"\nPARTIDO: {match.HomeTeam.Name} (Local) vs {match.AwayTeam.Name} (Visitante)");
            sb.AppendLine($"Torneo: {match.Tournament?.Name}");
            sb.AppendLine($"Fecha: {match.MatchDate:dd/MM/yyyy}");

            sb.AppendLine($"\nESTADÍSTICAS ACTUALES DE {match.HomeTeam.Name}:");
            sb.AppendLine($"- Puntos: {homeStats.Points}");
            sb.AppendLine($"- Partidos Jugados: {homeStats.Played}");
            sb.AppendLine($"- Goles a Favor: {homeStats.GF} / En Contra: {homeStats.GC}");
            sb.AppendLine($"- Rendimiento Reciente: {homeStats.Form} (G=Ganó, E=Empató, P=Perdió)");

            sb.AppendLine($"\nESTADÍSTICAS ACTUALES DE {match.AwayTeam.Name}:");
            sb.AppendLine($"- Puntos: {awayStats.Points}");
            sb.AppendLine($"- Partidos Jugados: {awayStats.Played}");
            sb.AppendLine($"- Goles a Favor: {awayStats.GF} / En Contra: {awayStats.GC}");
            sb.AppendLine($"- Rendimiento Reciente: {awayStats.Form}");

            sb.AppendLine("\nINSTRUCCIONES DE RESPUESTA (Formato JSON estricto):");
            sb.AppendLine("Devuelve SOLO un objeto JSON con este formato, sin texto extra, y NO utilices emojis en el campo analysis:");
            sb.AppendLine("{");
            sb.AppendLine("  \"analysis\": \"Un párrafo corto explicando por qué ganará quien tú dices. No debe contener ningún emoji.\",");
            sb.AppendLine("  \"probabilities\": \"Local: XX% - Empate: XX% - Visita: XX%\",");
            sb.AppendLine("  \"score\": \"M-M\" (Ej: 2-1)");
            sb.AppendLine("}");

            // 4. Llamar a Gemini
            var jsonResponse = await _aiService.GenerateTextAsync(sb.ToString());

            // 5. Limpieza básica del JSON (Gemini a veces pone ```json ... ```)
            jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();

            return new MatchAnalysisDto(jsonResponse, "Calculado por IA", "Ver análisis");
        }

        // Helper para calcular stats rápidos
        private async Task<dynamic> GetTeamStats(Guid teamId, Guid tournamentId, CancellationToken ct)
        {
            var matches = await _context.Matches
                .Where(m => m.TournamentId == tournamentId && m.Status == MatchStatus.Finished && (m.HomeTeamId == teamId || m.AwayTeamId == teamId))
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync(ct);

            int points = 0, gf = 0, gc = 0;
            string form = "";

            foreach (var m in matches)
            {
                bool isHome = m.HomeTeamId == teamId;
                int myScore = isHome ? (m.HomeScore ?? 0) : (m.AwayScore ?? 0);
                int rivalScore = isHome ? (m.AwayScore ?? 0) : (m.HomeScore ?? 0);

                gf += myScore;
                gc += rivalScore;

                if (myScore > rivalScore) { points += 3; if (form.Length < 5) form += "G "; }
                else if (myScore == rivalScore) { points += 1; if (form.Length < 5) form += "E "; }
                else { if (form.Length < 5) form += "P "; }
            }

            return new { Points = points, Played = matches.Count, GF = gf, GC = gc, Form = form.Trim() };
        }
    }
}