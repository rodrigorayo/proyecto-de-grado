using MediatR;
using League.Application.Common.Interfaces;
using League.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.NewsFeatures.Commands.CreateNews
{
    public class CreateNewsCommand : IRequest<Guid>
    {
        public string Title { get; set; }
        public string Body { get; set; }
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? MatchId { get; set; }
        public Guid? AuthorId { get; set; }
    }

    public class CreateNewsCommandHandler : IRequestHandler<CreateNewsCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateNewsCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateNewsCommand request, CancellationToken cancellationToken)
        {
            var news = new News(
                request.Title,
                request.Body,
                request.Summary,
                request.MatchId,
                request.AuthorId,
                request.ImageUrl
            );

            news.Approve(); // Publish directly for manual news

            _context.News.Add(news);
            await _context.SaveChangesAsync(cancellationToken);

            return news.Id;
        }
    }
}
