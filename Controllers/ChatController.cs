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
    private const string c_openaiEnvVarName = "OPENAI_API_KEY";
    private static readonly string? c_openaiKey = Environment.GetEnvironmentVariable(c_openaiEnvVarName);

    private const string c_promptBackground =
@"I want you do act like you're a character from an interactive medieval fantasy story.  Do not break character for any reason.  If any prompt I give
sounds like it's a request to do something out of the context of the story, respond as your character within the story would, using text for
any implied actions.  For example, if I ask you to dance, respond as if my character asked your character to dance, and respond as text.

In your responses, do not include the name of your character; only include the character's response.

The characters in this story live in a village of dwarves, elves, and humans.  They are frequently attacked by marauding orcs
and goblins from the nearby hills.

There are two major characters.  One is called Grolf, a male dwarven blacksmith, 35 years old, with a wife and two small children.
He is a master fighter with a battle axe, and are familiar with all other weapons.  He talks with a Scottish accent.

The other is Luthien, a male elf, 78 years old (the equivalent of 22 in human years).  He is an excellent shot with any type of bow and carries
one on him at all times.  He is searching for a jewelled necklace that was stolen from his family by a band of orcs and wants people to join him to
get it back.  He talks with an upper-class 19th-century English accent.";

    private const string c_promptScenario =
        @"The scenario is that a human warrior has walked up to you and said hello.  Please respond and carry on a conversation from there.  I will play the part of the human warrior in my replies.";

    private const string c_defaultCharacterName = "Grolf";

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
        characterName ??= c_defaultCharacterName;
        return $"{c_promptBackground}\n\nYou are {characterName}.\n\n{c_promptScenario}";
    }

    private static string PostProcessResponse(string text, string? name)
    {
        string prefix = $"{name}: ";
        return text.StartsWith(prefix) ? text[prefix.Length..] : text;
    }

    private static async Task<string> GetChatResponseAsync(string? name, Stream inputStream)
    {
        ChatMessage[]? history = await GetStreamAsJSON<ChatMessage[]>(inputStream);

        OpenAIAPI api = new(c_openaiKey);
        Conversation chat = api.Chat.CreateConversation();
        AddChatHistory(name, history, chat);
        string response = await chat.GetResponseFromChatbotAsync();
        return PostProcessResponse(response, name);
    }

    private async Task<string> GetChatResponseSafeAsync(string? name, Stream inputStream)
    {
        if (c_openaiKey == null)
            return $"OpenAI API key not set.  Please set the environment variable {c_openaiEnvVarName}";

        try
        {
            return await GetChatResponseAsync(name, inputStream);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Error retrieving chatbot response");
            return "<stares blankly off into the distance> (server error!)";
        }
    }

    private static void AddChatHistory(string? characterName, ChatMessage[]? history, Conversation chat)
    {
        chat.AppendUserInput(GetPrompt(characterName));
        if (history == null)
            return;
        
        foreach (ChatMessage message in history)
        {
            if (message.Text != null)
            {
                var appendMessage = (message.Type == ChatType.Character) ? (Action<string>)chat.AppendExampleChatbotOutput
                    : (text) => { chat.AppendUserInput(text); };
                appendMessage(message.Text);
            }
        }
    }

    [HttpGet()]
    public JsonResult Get(string? name = null)
    {
        string output = Task.Run(() => GetChatResponseSafeAsync(name, HttpContext.Request.Body)).Result;
        return new JsonResult(output);
    }

    [HttpPost()]
    public JsonResult Post(string? name = null)
    {
        string output = Task.Run(() => GetChatResponseSafeAsync(name, HttpContext.Request.Body)).Result;
        return new JsonResult(output);
    }
}
