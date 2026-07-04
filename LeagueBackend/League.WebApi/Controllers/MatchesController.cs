using League.Application.Features.Matches.Commands.CreateMatch;
using League.Application.Features.Matches.Commands.GenerateChronicle;
using League.Application.Features.Matches.Commands.UpdateMatchResult; // 👈 Asegúrate de importar esto
using League.Application.Features.Matches.Commands.UpdateMatchChronicle;

using League.Application.Features.Matches.Queries.GetMatchesByTournament;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace League.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MatchesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Matches/ByTournament/{tournamentId}
        [HttpGet("ByTournament/{tournamentId}")]
        public async Task<IActionResult> GetByTournament(Guid tournamentId)
        {
            var matches = await _mediator.Send(new GetMatchesByTournamentQuery(tournamentId));
            return Ok(matches);
        }

        // POST: api/Matches (Crear Partido)
        [HttpPost]
        [Authorize] // Roles = "Admin" idealmente
        public async Task<IActionResult> Create([FromBody] CreateMatchCommand command)
        {
            try
            {
                var id = await _mediator.Send(command);
                return Ok(new { Id = id, Message = "Partido programado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message ?? "No hay detalles adicionales."
                });
            }
        }

        // PUT: api/Matches/{id}/Result (Cargar Resultado)
        // Este es el método que usará el COMITÉ
        [HttpPut("{id}/Result")]
        [Authorize] // Roles = "Committee, Admin"
        public async Task<IActionResult> RegisterResult(Guid id, [FromBody] UpdateMatchResultCommand command)
        {
            if (id != command.MatchId) return BadRequest("El ID de la URL no coincide con el cuerpo.");

            try
            {
                var success = await _mediator.Send(command);

                if (!success) return NotFound("Partido no encontrado o ya finalizado.");

                return Ok(new { Message = "Resultado registrado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("{id}/Chronicle")]
        public async Task<IActionResult> UpdateChronicle(Guid id, [FromBody] UpdateMatchChronicleCommand command)
        {
            if (id != command.MatchId) return BadRequest("El ID de la URL no coincide con el cuerpo.");

            try
            {
                var success = await _mediator.Send(command);
                if (!success) return NotFound("Partido no encontrado.");
                return Ok(new { Message = "Crónica actualizada correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }


        [HttpPost("{id}/generate-chronicle")]
        // [Authorize(Roles = "Admin,Committee")] // Descomenta esto después para seguridad
        public async Task<IActionResult> GenerateChronicle(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new GenerateMatchChronicleCommand(id));
                return Ok(new { Chronicle = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}