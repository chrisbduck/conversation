using Microsoft.AspNetCore.Mvc;
using OpenAI_API;
using OpenAI_API.Chat;

namespace webapi.Controllers;

[ApiController]
[Route("[controller]")]
public class ChatController : Controller
{
    private const string c_openaiKey = "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";

    private readonly ILogger<ChatController> _logger;

    public ChatController(ILogger<ChatController> logger)
    {
        _logger = logger;
    }

    private async Task<string> GetExampleOutputAsync()
    {
        OpenAIAPI api = new(c_openaiKey);

        Conversation chat = api.Chat.CreateConversation();
        chat.AppendUserInput("Tell me a random joke!");
        return await chat.GetResponseFromChatbotAsync();
    }

    [HttpGet(Name = "GetCompletion")]
    public JsonResult Get(string query)
    {
        string output = Task.Run(GetExampleOutputAsync).Result;
        Console.WriteLine(output);
        return new JsonResult(output);
    }
}
