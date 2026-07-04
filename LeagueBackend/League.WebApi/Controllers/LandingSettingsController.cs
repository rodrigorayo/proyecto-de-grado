using League.Application.Features.LandingSettings.Commands.UpdateLandingSettings;
using League.Application.Features.LandingSettings.Queries.GetLandingSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace League.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LandingSettingsController : ControllerBase
    {
        private readonly MediatR.IMediator _mediator;

        public LandingSettingsController(MediatR.IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<LandingSettingsDto>> GetSettings()
        {
            var result = await _mediator.Send(new GetLandingSettingsQuery());
            return Ok(result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateSettings([FromBody] UpdateLandingSettingsCommand command)
        {
            await _mediator.Send(command);
            return NoContent();
        }
    }
}
