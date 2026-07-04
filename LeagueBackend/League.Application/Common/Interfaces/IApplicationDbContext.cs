using League.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace League.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Team> Teams { get; }
        DbSet<Player> Players { get; }
        DbSet<Tournament> Tournaments { get; }

        // 👇👇 AGREGA ESTA LÍNEA QUE ES LA QUE FALTA 👇👇
        DbSet<Match> Matches { get; }
        DbSet<MatchEvent> MatchEvents { get; }
        DbSet<News> News { get; }
        DbSet<Prediction> Predictions { get; }
        DbSet<LandingSetting> LandingSettings { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}