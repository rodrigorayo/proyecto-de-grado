using System;
using System.Threading;
using System.Threading.Tasks;
using League.Application.Common.Interfaces;
using League.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace League.Application.Features.LandingSettings.Commands.UpdateLandingSettings
{
    public class UpdateLandingSettingsCommandHandler : IRequestHandler<UpdateLandingSettingsCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public UpdateLandingSettingsCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateLandingSettingsCommand request, CancellationToken cancellationToken)
        {
            var settings = await _context.LandingSettings.FirstOrDefaultAsync(cancellationToken);
            
            if (settings == null)
            {
                settings = new LandingSetting
                {
                    Id = Guid.NewGuid()
                };
                _context.LandingSettings.Add(settings);
            }

            settings.HeroTitle = request.HeroTitle;
            settings.HeroSubtitle = request.HeroSubtitle;
            settings.HeroDescription = request.HeroDescription;
            settings.PopUpEnabled = request.PopUpEnabled;
            settings.PopUpTitle = request.PopUpTitle;
            settings.PopUpContent = request.PopUpContent;
            settings.PopUpImageUrl = request.PopUpImageUrl;
            settings.PopUpLinkUrl = request.PopUpLinkUrl;
            settings.AboutMission = request.AboutMission;
            settings.AboutVision = request.AboutVision;

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
