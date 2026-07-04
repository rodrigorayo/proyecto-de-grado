using League.Application.Features.Predictions.Commands.SubmitPrediction;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace League.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PredictionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PredictionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/Predictions (Enviar Pronóstico)
        [HttpPost]
        [Authorize] // 🔒 OBLIGATORIO: Solo usuarios logueados pueden apostar
        public async Task<IActionResult> Submit([FromBody] SubmitPredictionCommand command)
        {
            try
            {
                // 🔐 SEGURIDAD CRÍTICA:
                // No confiamos en el UserId que venga en el JSON (si es que viene).
                // Extraemos el UserId real del Token JWT para evitar suplantación de identidad.

                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Intentamos obtener el nombre del usuario del token, si no existe ponemos "Usuario"
                var userName = User.FindFirst("FullName")?.Value
                               ?? User.Identity?.Name
                               ?? "Usuario";

                if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                {
                    return Unauthorized("No se pudo identificar al usuario. Token inválido.");
                }

                // Creamos una COPIA segura del comando con los datos del token
                // (Usamos 'with' para crear una copia inmutable del record modificando solo lo necesario)
                var secureCommand = command with
                {
                    UserId = userId,
                    UserName = userName
                };

                var predictionId = await _mediator.Send(secureCommand);

                return Ok(new { Id = predictionId, Message = "Predicción guardada exitosamente. ¡Suerte! 🍀" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("Analyze/{matchId}")]
        // [Authorize(Roles = "Admin")] // Descomenta cuando quieras protegerlo
        public async Task<IActionResult> AnalyzeMatch(Guid matchId)
        {
            try
            {
                var analysis = await _mediator.Send(new League.Application.Features.Predictions.Queries.AnalyzeMatch.AnalyzeMatchQuery(matchId));

                // Gemini devuelve un string JSON, intentamos parsearlo para devolver un objeto real
                try
                {
                    var jsonObj = System.Text.Json.JsonSerializer.Deserialize<object>(analysis.AnalysisText);
                    return Ok(jsonObj);
                }
                catch
                {
                    // Si falla el parseo, devolvemos el texto plano
                    return Ok(new { RawAnalysis = analysis.AnalysisText });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Aquí agregaremos el GET Ranking más adelante...
    }
}