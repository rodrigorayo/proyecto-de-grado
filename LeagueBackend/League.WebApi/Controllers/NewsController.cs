using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using League.Application.Features.NewsFeatures.Commands.CreateNews;
using League.Application.Features.NewsFeatures.Commands.UpdateNews;
using League.Application.Features.NewsFeatures.Commands.DeleteNews;
using League.Application.Features.NewsFeatures.Queries.GetAllNews;
using League.Application.Features.NewsFeatures.Queries.GetPublishedNews;

namespace League.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NewsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedNews()
        {
            var result = await _mediator.Send(new GetPublishedNewsQuery());
            return Ok(result);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllNews()
        {
            var result = await _mediator.Send(new GetAllNewsQuery());
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateNews([FromBody] CreateNewsCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { Id = id });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateNews(Guid id, [FromBody] UpdateNewsCommand command)
        {
            command.Id = id;
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteNews(Guid id)
        {
            await _mediator.Send(new DeleteNewsCommand { Id = id });
            return NoContent();
        }
    }
}
