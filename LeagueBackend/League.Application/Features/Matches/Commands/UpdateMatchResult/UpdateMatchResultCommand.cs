using MediatR;
using League.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using League.Domain.Entities;

namespace League.Application.Features.Matches.Commands.UpdateMatchResult
{
    // 1. Datos que vienen del Frontend (DTO)
    public class UpdateMatchResultCommand : IRequest<bool>
    {
        public Guid MatchId { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public string? Incidents { get; set; } // Observaciones del árbitro
    }

    // 2. Lógica de negocio
    public class UpdateMatchResultCommandHandler : IRequestHandler<UpdateMatchResultCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateMatchResultCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateMatchResultCommand request, CancellationToken cancellationToken)
        {
            // A. Buscamos el partido por GUID
            var match = await _context.Matches.FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);
            if (match == null) return false; // No existe

            try
            {
                // B. Actualizamos el partido
                // Usamos el método UpdateResultDetails que creamos en Match.cs para guardar Goles + Incidencias + Status
                match.UpdateResultDetails(request.HomeScore, request.AwayScore, request.Incidents);

                // 👇👇👇 C. MAGIA DE PREDICCIONES (PRODE) 👇👇👇

                // 1. Traemos todas las predicciones asociadas a este partido
                var predictions = await _context.Predictions
                    .Where(p => p.MatchId == request.MatchId)
                    .ToListAsync(cancellationToken);

                // 2. Recorremos cada predicción y calculamos si ganó puntos
                foreach (var pred in predictions)
                {
                    // El método CalculatePoints está en tu entidad Prediction.cs
                    // Comparará el pronóstico del usuario vs el resultado real (request.HomeScore)
                    pred.CalculatePoints(request.HomeScore, request.AwayScore);
                }

                // 👆👆👆 FIN MAGIA 👆👆👆
            }
            catch (Exception)
            {
                // Si hay un error de lógica de dominio (ej: marcador negativo), retornamos false
                return false;
            }

            // D. Guardamos TODOS los cambios (Partido actualizado + Puntos de usuarios asignados)
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}