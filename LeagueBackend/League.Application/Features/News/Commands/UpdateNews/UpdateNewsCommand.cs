using MediatR;
using League.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.NewsFeatures.Commands.UpdateNews
{
    public class UpdateNewsCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateNewsCommandHandler : IRequestHandler<UpdateNewsCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public UpdateNewsCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateNewsCommand request, CancellationToken cancellationToken)
        {
            var news = await _context.News.FindAsync(new object[] { request.Id }, cancellationToken);
            if (news == null) throw new Exception("Noticia no encontrada.");

            news.UpdateInfo(request.Title, request.Body, request.Summary, request.ImageUrl);

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
