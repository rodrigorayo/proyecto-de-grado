using League.Application.Common.Interfaces;
using League.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.Predictions.Commands.SubmitPrediction
{
    // El usuario envía: Partido y Resultado (El UserId lo sacamos del Token en el Controller)
    public record SubmitPredictionCommand(Guid MatchId, Guid UserId, string UserName, int HomeScore, int AwayScore) : IRequest<Guid>;

    public class SubmitPredictionCommandHandler : IRequestHandler<SubmitPredictionCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public SubmitPredictionCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(SubmitPredictionCommand request, CancellationToken cancellationToken)
        {
            // 1. Validar Partido
            var match = await _context.Matches.FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);
            if (match == null) throw new Exception("Partido no encontrado.");

            // 2. Validar Tiempo (Ej: Hasta 5 minutos antes)
            if (match.MatchDate <= DateTime.UtcNow.AddMinutes(5))
                throw new Exception("El partido está por comenzar o ya inició. Apuestas cerradas.");

            // 3. Buscar si ya existe predicción
            var prediction = await _context.Predictions
                .FirstOrDefaultAsync(p => p.MatchId == request.MatchId && p.UserId == request.UserId, cancellationToken);

            if (prediction != null)
            {
                // ACTUALIZAR
                prediction.UpdatePrediction(request.HomeScore, request.AwayScore);
            }
            else
            {
                // CREAR
                prediction = new Prediction(request.MatchId, request.UserId, request.UserName, request.HomeScore, request.AwayScore);
                _context.Predictions.Add(prediction);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return prediction.Id;
        }
    }
}