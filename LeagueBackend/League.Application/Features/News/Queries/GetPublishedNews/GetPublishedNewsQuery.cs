using MediatR;
using League.Application.Common.Interfaces;
using League.Domain.Entities;
using League.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.NewsFeatures.Queries.GetPublishedNews
{
    public class GetPublishedNewsQuery : IRequest<List<NewsDto>>
    {
    }

    public class NewsDto
    {
        public System.Guid Id { get; set; }
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public string? ImageUrl { get; set; }
        public System.DateTime GeneratedAt { get; set; }
        public System.Guid? MatchId { get; set; }
    }

    public class GetPublishedNewsQueryHandler : IRequestHandler<GetPublishedNewsQuery, List<NewsDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetPublishedNewsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<NewsDto>> Handle(GetPublishedNewsQuery request, CancellationToken cancellationToken)
        {
            return await _context.News
                .Where(n => n.Status == NewsStatus.Published)
                .OrderByDescending(n => n.GeneratedAt)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Summary = n.Summary,
                    Body = n.Body,
                    ImageUrl = n.ImageUrl,
                    GeneratedAt = n.GeneratedAt,
                    MatchId = n.MatchId
                })
                .ToListAsync(cancellationToken);
        }
    }
}
