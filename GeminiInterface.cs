using System.Text;
using System.Text.Json;

namespace CharacterConversation
{
    public class GeminiInterface
    {
        const string c_baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

        readonly string m_key;
        readonly string m_url;

        public GeminiInterface()
        {
            m_key = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? throw new InvalidOperationException("Gemini API key not set");
            m_url = c_baseUrl + m_key;
        }

        private static StringContent GenerateRequestBody(string prompt)
        {
            var contents = new
            {
                parts = new[]
                {
                    new { text = prompt }
                }
            };
            var requestBody = new { contents };
            string jsonBody = JsonSerializer.Serialize(requestBody);
            return new StringContent(jsonBody, Encoding.UTF8, "application/json");
        }

        private static string GetResponseText(string responseBodyJson)
        {
            using JsonDocument doc = JsonDocument.Parse(responseBodyJson);
            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0] // First part
                .GetProperty("text")
                .GetString() ?? "";
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            StringContent content = GenerateRequestBody(prompt);
            using HttpClient client = new();
            HttpResponseMessage response = await client.PostAsync(m_url, content);

            string responseBody = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return $"Error {response.StatusCode}: {responseBody}";
            
            try
            {
                return GetResponseText(responseBody);
            }
            catch (Exception exception)
            {
                return $"Exception parsing response: ${exception}";
            }
        }
    }
}
