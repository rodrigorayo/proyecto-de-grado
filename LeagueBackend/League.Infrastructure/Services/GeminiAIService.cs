using League.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace League.Infrastructure.Services
{
    public class GeminiAIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string _model = "gemini-2.5-flash"; 

        public GeminiAIService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["GeminiSettings:ApiKey"];
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            // 1. La URL de la API de Google
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            // 2. El cuerpo de la petición (JSON que pide Google)
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            // 3. Enviar petición
            var response = await _httpClient.PostAsync(url, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Error de Gemini AI ({response.StatusCode}): {error}");
            }

            // 4. Leer respuesta
            var responseString = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(responseString);

            // 5. Extraer el texto limpio (Google devuelve un JSON anidado)
            // Estructura: candidates[0] -> content -> parts[0] -> text
            try
            {
                var text = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();
                return text ?? "La IA no devolvió texto.";
            }
            catch
            {
                return "Error procesando la respuesta de la IA.";
            }
        }
    }
}