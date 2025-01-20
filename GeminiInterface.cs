using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Gemini
{
    public enum ChatType { Character, User };

    public class ChatMessage
    {
        public ChatType Type { get; init; }
        public string? Text { get; init; }
    };

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum Role { User, Model };

    public class TextPart(string text)
    {
        public string Text { get; init; } = text;
    }

    public class ContentElement
    {
        public ContentElement(ChatType type, string text)
        {
            Role = (type == ChatType.User) ? Role.User : Role.Model;
            Parts = [new TextPart(text)];
        }

        public Role Role { get; set; }
        public TextPart[] Parts { get; init; }
    };

    public class GeminiInterface
    {
        const string c_baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

        readonly string m_key;
        readonly string m_url;
        readonly JsonSerializerOptions m_options = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

        public GeminiInterface()
        {
            m_key = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? throw new InvalidOperationException("Gemini API key not set");
            m_url = c_baseUrl + m_key;
        }

        private StringContent GenerateChatRequestBody(string prompt, ChatMessage[]? history)
        {
            List<ContentElement> elements = [new ContentElement(ChatType.User, prompt)];
            if (history != null)
            {
                elements.AddRange(history.Where(message => message?.Text != null)
                    .Select(message => new ContentElement(message.Type, message.Text ?? "")));
            }

            var requestBody = new { contents = elements };
            string jsonBody = JsonSerializer.Serialize(requestBody, m_options);
            return new StringContent(jsonBody, Encoding.UTF8, "application/json");
        }

        private StringContent GenerateTextRequestBody(string prompt)
        {
            var contents = new[] { new ContentElement(ChatType.User, prompt) };
            var requestBody = new { contents };
            string jsonBody = JsonSerializer.Serialize(requestBody, m_options);
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
            StringContent content = GenerateTextRequestBody(prompt);
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

        public async Task<string> GenerateChatAsync(string prompt, ChatMessage[]? history)
        {
            StringContent content = GenerateChatRequestBody(prompt, history);
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
