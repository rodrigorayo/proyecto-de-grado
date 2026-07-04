using MediatR;
using League.Application.Common.Interfaces;
using League.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using League.Application.Features.NewsFeatures.Queries.GetPublishedNews;

namespace League.Application.Features.NewsFeatures.Queries.GetAllNews
{
    public class GetAllNewsQuery : IRequest<List<NewsDto>>
    {
    }

    public class GetAllNewsQueryHandler : IRequestHandler<GetAllNewsQuery, List<NewsDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllNewsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<NewsDto>> Handle(GetAllNewsQuery request, CancellationToken cancellationToken)
        {
            return await _context.News
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
