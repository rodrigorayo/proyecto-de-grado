using MediatR;

namespace League.Application.Features.LandingSettings.Commands.UpdateLandingSettings
{
    public class UpdateLandingSettingsCommand : IRequest<Unit>
    {
        public string HeroTitle { get; set; } = string.Empty;
        public string HeroSubtitle { get; set; } = string.Empty;
        public string HeroDescription { get; set; } = string.Empty;
        public bool PopUpEnabled { get; set; }
        public string PopUpTitle { get; set; } = string.Empty;
        public string PopUpContent { get; set; } = string.Empty;
        public string PopUpImageUrl { get; set; } = string.Empty;
        public string PopUpLinkUrl { get; set; } = string.Empty;
        public string AboutMission { get; set; } = string.Empty;
        public string AboutVision { get; set; } = string.Empty;
    }
}
