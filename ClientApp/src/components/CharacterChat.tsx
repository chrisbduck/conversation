import * as React from 'react';
import { CharacterImgSrc } from '../Shared';

enum ChatType { Character, User };

interface IMessage {
  chatType: ChatType;
  text: string;
  key: string;
};

interface ICharacterResponse {
  type: 'error' | 'text',
  text: string,
};

async function fetchCharacterResponse(name: string, history: IMessage[]): Promise<ICharacterResponse> {
  const chatHistory = history.map(msg => ({ type: msg.chatType, text: msg.text }));
  const historyText = JSON.stringify(chatHistory);

  let response: Response | undefined;
  try {
    response = await fetch(`chat?name=${name}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: historyText
    });
  } catch (exception) {
    return { type: 'error', text: exception };
  }

  if (!response.ok)
    return { type: 'error', text: response.statusText };

  return { type: 'text', text: await response.json() };
}

function ChatMessage({ msg, name }: { msg: IMessage, name: string }) {
  const text = msg.text.trim();
  const key = msg.key;
  if (msg.chatType === ChatType.User)
    return <blockquote key={key}><b>You:</b> {text}</blockquote>;

  const split = text.split('\n');
  const firstParagraph = <p key={key}><b>{name}:</b> {split[0]}</p>;
  if (split.length < 2)
    return firstParagraph;

  split.shift();
  return <div>
    {firstParagraph}
    {split.map(text => <p>{text}</p>)}
  </div>
}

function CharacterCharContents({ name, isLoading, errorMsg, history }:
    { name: string, isLoading: boolean, errorMsg: string, history: IMessage[] }) {
  if (errorMsg)
    return <p><b>{errorMsg}</b></p>;

  const contents = <div>
    {history.map(msg => <ChatMessage msg={msg} name={name} />)}
    {isLoading ? <p><b><i>Waiting for {name}...</i></b></p> : null}
  </div>
  return contents;
}

export function CharacterChat({ name }: { name: string }) {
  const [isLoading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [userText, setUserText] = React.useState('');
  const [history, setHistory] = React.useState<IMessage[]>([]);

  const addChatMessage = React.useCallback((type: ChatType, text: string) => {
    setHistory(history => [...history, { chatType: type, text: text, key: history.length.toString() }]);
    setLoading(false);
  }, [setHistory, setLoading]);

  function submitUserChat(text: string) {
    if (!text)
      return;
    addChatMessage(ChatType.User, userText.trim()); // the history change will submit the chat
    setUserText('');
  }

  // When the history changes and the last message was from the user, or on the first call,
  // request the next response
  React.useEffect(() => {
    // Ignore responses from the server
    if (history.length > 0 && history[history.length - 1].chatType !== ChatType.User)
      return;

    // Request the next response
    setLoading(true);
    (async function () {
      const charResponse = await fetchCharacterResponse(name, history);
      if (charResponse.type === 'error') {
        setErrorMsg(charResponse.text);
        return;
      }
      addChatMessage(ChatType.Character, charResponse.text);
    })();
  }, [addChatMessage, history, name, setErrorMsg, setLoading]);

  return (
    <div className="bottom-padded">
      <h1>Conversation</h1>
      <img src={CharacterImgSrc[name]} className="resized-image" />
      <CharacterCharContents name={name} isLoading={isLoading} errorMsg={errorMsg} history={history} />
      <b>Say something:</b>
      <input name="userQuery" disabled={isLoading} value={userText}
        onChange={event => setUserText(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') submitUserChat(userText); }}
      />
      <button type="button" onClick={() => submitUserChat(userText)} disabled={isLoading}>submit</button>
    </div>
  );
}
