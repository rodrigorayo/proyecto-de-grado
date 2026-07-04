using League.Domain.Common;
using League.Domain.Enums;
using System;

namespace League.Domain.Entities
{
    public class News : BaseEntity
    {
        public Guid? MatchId { get; private set; }
        public string Title { get; private set; }
        public string Summary { get; private set; }
        public string Body { get; private set; }
        public NewsStatus Status { get; private set; }
        public DateTime GeneratedAt { get; private set; }
        public Guid? AuthorId { get; private set; }
        public string? ImageUrl { get; private set; }

        public News(string title, string body, string summary = null, Guid? matchId = null, Guid? authorId = null, string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Título requerido.");
            if (string.IsNullOrWhiteSpace(body)) throw new DomainException("Cuerpo de noticia requerido.");
            Title = title.Trim();
            Body = body;
            Summary = string.IsNullOrWhiteSpace(summary) ? (body.Length > 150 ? body.Substring(0, 150) + "..." : body) : summary;
            MatchId = matchId;
            AuthorId = authorId;
            ImageUrl = imageUrl;
            Status = NewsStatus.Draft;
            GeneratedAt = DateTime.UtcNow;
        }

        public void SetPending() { Status = NewsStatus.Pending; Touch(); }
        public void Approve() { Status = NewsStatus.Published; Touch(); }
        public void Reject() { Status = NewsStatus.Rejected; Touch(); }

        public void UpdateInfo(string title, string body, string summary = null, string imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Título requerido.");
            if (string.IsNullOrWhiteSpace(body)) throw new DomainException("Cuerpo requerido.");
            Title = title.Trim();
            Body = body;
            Summary = string.IsNullOrWhiteSpace(summary) ? (body.Length > 150 ? body.Substring(0, 150) + "..." : body) : summary;
            if (imageUrl != null) ImageUrl = imageUrl;
            Touch();
        }
    }
}
