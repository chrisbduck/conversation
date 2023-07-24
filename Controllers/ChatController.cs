using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OpenAI_API;
using OpenAI_API.Chat;

namespace webapi.Controllers;

public class ChatHistory
{
    public string[]? CharacterHistory { get; set; }
    public string[]? UserHistory { get; set; }
};

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

    private static async Task<T?> GetStreamAsJSON<T>(Stream inputStream)
    {
        string input;
        using (var reader = new StreamReader(inputStream)) {
            input = await reader.ReadToEndAsync();
        }
        return JsonConvert.DeserializeObject<T>(input);
    }

    private async Task<string> GetChatResponseAsync(Stream inputStream)
    {
        ChatHistory? history = await GetStreamAsJSON<ChatHistory>(inputStream);

        OpenAIAPI api = new(c_openaiKey);

        Conversation chat = api.Chat.CreateConversation();
        chat.AppendUserInput(
            @"I want you do act like you're a character from an interactive medieval fantasy story.  Do not break character for any reason.

            Your back story is that you're a dwarven blacksmith, 35 years old, with a wife and two small children.  You are a master fighter with a battle axe,
            and are familiar with all other weapons.  Your name is Grolf, and you talk with a Scottish accent.

            The scenario is that a human warrior has walked up to you and said hello.  Please respond and carry on a conversation from there."
        );
        chat.AppendExampleChatbotOutput("Ah, greetings and good day to ye, laddie!");
        chat.AppendUserInput("What weapons are on sale today?");
        /*if (history != null)
        {
            int characterIndex = 0;
            int userIndex = 0;
            if (history.CharacterHistory == null)
                throw new InvalidOperationException("Invalid character history");
            if (history.UserHistory == null)
                throw new InvalidOperationException("Invalid user history");
            while (characterIndex < history.CharacterHistory.Length || userIndex < history.UserHistory.Length)
            {
                if (characterIndex < history.CharacterHistory.Length)
                    chat.AppendExampleChatbotOutput(history.CharacterHistory[characterIndex++]);
                if (userIndex < history.UserHistory.Length)
                    chat.AppendUserInput(history.UserHistory[userIndex++]);
            }
        }*/
        return await chat.GetResponseFromChatbotAsync();
    }

    [HttpGet()]
    public JsonResult Get()
    {
        string output = Task.Run(() => GetChatResponseAsync(HttpContext.Request.Body)).Result;
        Console.WriteLine(output);
        return new JsonResult(output);
    }

    [HttpPost()]
    public JsonResult Post()
    {
        string output = Task.Run(() => GetChatResponseAsync(HttpContext.Request.Body)).Result;
        Console.WriteLine(output);
        return new JsonResult(output);
    }
}
