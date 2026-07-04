using League.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.Matches.Commands.UpdateMatchChronicle
{
    public record UpdateMatchChronicleCommand(Guid MatchId, string Chronicle) : IRequest<bool>;

    public class UpdateMatchChronicleCommandHandler : IRequestHandler<UpdateMatchChronicleCommand, bool>
    {
        private readonly IMatchRepository _repository;
        private readonly IApplicationDbContext _context;

        public UpdateMatchChronicleCommandHandler(IMatchRepository repository, IApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<bool> Handle(UpdateMatchChronicleCommand request, CancellationToken cancellationToken)
        {
            var match = await _repository.GetByIdAsync(request.MatchId);
            if (match == null) return false;

            match.UpdateChronicle(request.Chronicle);
            await _repository.UpdateAsync(match);

            // Sync with News
            var title = match.HomeTeam != null && match.AwayTeam != null 
                ? $"Crónica: {match.HomeTeam.Name} vs {match.AwayTeam.Name}"
                : "Crónica de Partido";
            
            var existingNews = await _context.News.FirstOrDefaultAsync(n => n.MatchId == request.MatchId, cancellationToken);
            if (existingNews != null)
            {
                existingNews.UpdateInfo(title, request.Chronicle);
            }
            else
            {
                var news = new League.Domain.Entities.News(title, request.Chronicle, matchId: request.MatchId);
                news.Approve(); // Auto-publish AI chronicles
                _context.News.Add(news);
            }
            
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
