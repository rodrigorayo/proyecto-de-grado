using System;
using League.Domain.Common;

namespace League.Domain.Entities
{
    public class LandingSetting : BaseEntity
    {
        // Hero Section
        public string HeroTitle { get; set; } = string.Empty;
        public string HeroSubtitle { get; set; } = string.Empty;
        public string HeroDescription { get; set; } = string.Empty;

        // Pop-up Section
        public bool PopUpEnabled { get; set; } = false;
        public string PopUpTitle { get; set; } = string.Empty;
        public string PopUpContent { get; set; } = string.Empty;
        public string PopUpImageUrl { get; set; } = string.Empty;
        public string PopUpLinkUrl { get; set; } = string.Empty;

        // About (Sobre la Liga) Section
        public string AboutMission { get; set; } = string.Empty;
        public string AboutVision { get; set; } = string.Empty;
    }
}
