using League.Application.Common.Interfaces;
using League.Domain.Enums;
using MediatR;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.Matches.Commands.GenerateChronicle
{
    // Recibe el ID del partido y devuelve el texto generado
    public record GenerateMatchChronicleCommand(Guid MatchId) : IRequest<string>;

    public class GenerateMatchChronicleCommandHandler : IRequestHandler<GenerateMatchChronicleCommand, string>
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IMatchEventRepository _eventRepository;
        private readonly IAIService _aiService;

        public GenerateMatchChronicleCommandHandler(
            IMatchRepository matchRepository,
            IMatchEventRepository eventRepository,
            IAIService aiService)
        {
            _matchRepository = matchRepository;
            _eventRepository = eventRepository;
            _aiService = aiService;
        }

        public async Task<string> Handle(GenerateMatchChronicleCommand request, CancellationToken cancellationToken)
        {
            // 1. Obtener datos del partido
            var match = await _matchRepository.GetByIdAsync(request.MatchId);
            if (match == null) throw new Exception("Partido no encontrado.");

            // Usamos MatchStatus 
            if (match.Status != MatchStatus.Finished)
                throw new Exception("El partido debe haber finalizado para generar la crónica.");

            // 2. Obtener los eventos (goles, tarjetas)
            var events = await _eventRepository.GetByMatchIdAsync(request.MatchId);

            // 3. CONSTRUIR EL PROMPT
            var sb = new StringBuilder();
            sb.AppendLine("Actúa como un periodista deportivo apasionado de la Liga Gremial de Yacuiba.");
            sb.AppendLine("Escribe una crónica corta, emocionante y periodística sobre el siguiente partido.");
            sb.AppendLine("Usa un tono local, motivador y profesional.");

            sb.AppendLine($"\nDATOS DEL PARTIDO:");
            sb.AppendLine($"- Torneo: {match.Tournament?.Name ?? "Torneo Local"}");
            sb.AppendLine($"- Resultado Final: {match.HomeTeam.Name} {match.HomeScore} - {match.AwayScore} {match.AwayTeam.Name}");
            sb.AppendLine($"- Fecha: {match.MatchDate:dd/MM/yyyy}");

            sb.AppendLine("\nINCIDENCIAS DESTACADAS:");
            if (events.Count == 0)
            {
                sb.AppendLine("Fue un partido muy táctico sin incidencias mayores registradas en el sistema.");
            }
            else
            {
                foreach (var evt in events)
                {
                    string tipo = "Evento";

                    if (evt.Type == MatchEventType.Goal) tipo = "GOL de";
                    else if (evt.Type == MatchEventType.YellowCard) tipo = "Tarjeta Amarilla para";
                    else if (evt.Type == MatchEventType.RedCard) tipo = "Tarjeta ROJA para";
                    else if (evt.Type == MatchEventType.OwnGoal) tipo = "AUTOGOL de";

                    sb.AppendLine($"- Minuto {evt.Minute}': {tipo} {evt.Player?.FullName} ({evt.Player?.Team?.Name})");
                }
            }

            if (!string.IsNullOrEmpty(match.Incidents))
            {
                sb.AppendLine($"\nObservaciones del Árbitro: {match.Incidents}");
            }

            sb.AppendLine("\nINSTRUCCIONES DE FORMATO:");
            sb.AppendLine("- Escribe un Título llamativo en negrita.");
            sb.AppendLine("- Escribe 2 párrafos de resumen.");
            sb.AppendLine("- No uses saludos ni despedidas genéricas, ve directo a la noticia.");
            sb.AppendLine("- NUNCA menciones que eres una IA, Gemini, o un modelo de lenguaje. Escribe como un periodista humano.");
            sb.AppendLine("- NO utilices emojis en el texto bajo ninguna circunstancia. Mantén el tono periodístico y serio.");

            // 4. Llamar a la IA
            var chronicle = await _aiService.GenerateTextAsync(sb.ToString());

            // 5. Guardar en Base de Datos
            match.UpdateChronicle(chronicle);
            await _matchRepository.UpdateAsync(match);

            return chronicle;
        }
    }
}