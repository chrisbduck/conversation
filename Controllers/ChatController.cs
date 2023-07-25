using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OpenAI_API;
using OpenAI_API.Chat;

namespace webapi.Controllers;

public enum ChatType { Character, User };

public class ChatMessage
{
    public ChatType Type { get; set; }
    public string? Text { get; set; }
};

[ApiController]
[Route("[controller]")]
public class ChatController : Controller
{
    private const string c_openaiKey = "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";

    private const string c_promptBackground =
@"I want you do act like you're a character from an interactive medieval fantasy story.  Do not break character for any reason.

The characters in this story live in a village of dwarves, elves, and humans.  They are frequently attacked by marauding orcs
and goblins from the nearby hills.

There are two major characters.  One is called Grolf, a male dwarven blacksmith, 35 years old, with a wife and two small children.
He is a master fighter with a battle axe, and are familiar with all other weapons.  He talks with a Scottish accent.

The other is Luthien, a male elf, 78 years old (the equivalent of 22 in human years).  He is an excellent shot with any type of bow and carries
one on you at all times.  He is searching for a jewelled necklace that was stolen from your family by a band of orcs and wants people to join him to
get it back.  He talks with an upper-class 19th-century English accent.";

    private static readonly IReadOnlyDictionary<string, string> c_promptBackStories = new Dictionary<string, string>
    {
        { "Grolf", "You are Grolf." },
        { "Luthien", "You are Luthien." },
    };
    private const string c_promptScenario =
        @"The scenario is that a human warrior has walked up to you and said hello.  Please respond and carry on a conversation from there.";

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

    private static string GetPrompt(string? characterName)
    {
        string backStory = c_promptBackStories.GetValueOrDefault(characterName ?? "Grolf") ?? c_promptBackStories["Grolf"];
        return $"{c_promptBackground}\n\n{backStory}\n\n{c_promptScenario}";
    }

    private static async Task<string> GetChatResponseAsync(string? name, Stream inputStream)
    {
        ChatMessage[]? history = await GetStreamAsJSON<ChatMessage[]>(inputStream);

        OpenAIAPI api = new(c_openaiKey);

        Conversation chat = api.Chat.CreateConversation();
        chat.AppendUserInput(GetPrompt(name));
        if (history != null)
        {
            foreach (ChatMessage message in history)
            {
                var appendMessage = (message.Type == ChatType.Character) ? (Action<string>)chat.AppendExampleChatbotOutput : chat.AppendUserInput;
                if (message.Text != null)
                    appendMessage(message.Text);
            }
        }
        return await chat.GetResponseFromChatbotAsync();
    }

    [HttpGet()]
    public JsonResult Get(string? name = null)
    {
        string output = Task.Run(() => GetChatResponseAsync(name, HttpContext.Request.Body)).Result;
        Console.WriteLine(output);
        return new JsonResult(output);
    }

    [HttpPost()]
    public JsonResult Post(string? name = null)
    {
        string output = Task.Run(() => GetChatResponseAsync(name, HttpContext.Request.Body)).Result;
        Console.WriteLine(output);
        return new JsonResult(output);
    }
}
