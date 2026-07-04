using League.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.Tournaments.Commands.DeleteTournament
{
    public record DeleteTournamentCommand(Guid Id) : IRequest;

    public class DeleteTournamentCommandHandler : IRequestHandler<DeleteTournamentCommand>
    {
        private readonly ITournamentRepository _repository;

        public DeleteTournamentCommandHandler(ITournamentRepository repository) => _repository = repository;

        public async Task Handle(DeleteTournamentCommand request, CancellationToken cancellationToken)
        {
            var tournament = await _repository.GetByIdAsync(request.Id);
            if (tournament != null)
            {
                tournament.ToggleStatus();
                await _repository.UpdateAsync(tournament);
            }
        }

    }
}