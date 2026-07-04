using MediatR;
using League.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace League.Application.Features.NewsFeatures.Commands.DeleteNews
{
    public class DeleteNewsCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteNewsCommandHandler : IRequestHandler<DeleteNewsCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public DeleteNewsCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteNewsCommand request, CancellationToken cancellationToken)
        {
            var news = await _context.News.FindAsync(new object[] { request.Id }, cancellationToken);
            if (news == null) throw new Exception("Noticia no encontrada.");

            _context.News.Remove(news);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
