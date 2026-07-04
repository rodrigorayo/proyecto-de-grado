using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using League.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace League.Application.Features.LandingSettings.Queries.GetLandingSettings
{
    public class GetLandingSettingsQueryHandler : IRequestHandler<GetLandingSettingsQuery, LandingSettingsDto>
    {
        private readonly IApplicationDbContext _context;

        public GetLandingSettingsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LandingSettingsDto> Handle(GetLandingSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _context.LandingSettings.FirstOrDefaultAsync(cancellationToken);
            if (settings == null)
            {
                return new LandingSettingsDto();
            }

            return new LandingSettingsDto
            {
                Id = settings.Id,
                HeroTitle = settings.HeroTitle,
                HeroSubtitle = settings.HeroSubtitle,
                HeroDescription = settings.HeroDescription,
                PopUpEnabled = settings.PopUpEnabled,
                PopUpTitle = settings.PopUpTitle,
                PopUpContent = settings.PopUpContent,
                PopUpImageUrl = settings.PopUpImageUrl,
                PopUpLinkUrl = settings.PopUpLinkUrl,
                AboutMission = settings.AboutMission,
                AboutVision = settings.AboutVision
            };
        }
    }
}
