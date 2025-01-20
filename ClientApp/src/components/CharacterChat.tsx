import * as React from 'react';
import { ContainerProps } from 'reactstrap';
import { CharacterImgSrc } from '../Shared';

enum ChatType { Character, User };

interface IMessage {
  chatType: ChatType;
  text: string;
  key: string;
};

async function fetchCharacterResponse(name: string, history: IMessage[]): Promise<Response> {
  const chatHistory = history.map(msg => ({ type: msg.chatType, text: msg.text }));
  const historyText = JSON.stringify(chatHistory);
  return await fetch(`chat?name=${name}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: historyText
  });
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
  const [history, setHistory] = React.useState([]);

  function addChatMessage(type: ChatType, text: string) {
    setHistory([...history, { chatType: type, text: text, key: history.length.toString() }]);
    setLoading(false);
  }

  function submitUserChat() {
    addChatMessage(ChatType.User, userText.trim());
    setUserText('');
    requestCharacterResponse();
  }
  
  async function requestCharacterResponse() {
    setLoading(true);
    const response = await fetchCharacterResponse(name, history);
    if (!response.ok) {
      setErrorMsg(response.statusText);
      return;
    }
    const data = await response.json();
    addChatMessage(ChatType.Character, data);
  }

  // Request initial character prompt
  React.useEffect(() => {
    (async function () {
      const response = await fetch(`chat?name=${this.characterName}`);
      if (!response.ok) {
        this.setError(response.statusText);
        return;
      }
      const data = await response.json();
      addChatMessage(ChatType.Character, data);
    })();
  }, []);

  return (
    <div className="bottom-padded">
      <h1>Conversation</h1>
      <img src={CharacterImgSrc[name]} className="resized-image" />
      <CharacterCharContents name={name} isLoading={isLoading} errorMsg={errorMsg} history={history} />
      <b>Say something:</b>
      <input name="userQuery" disabled={isLoading}
        onChange={event => setUserText(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') submitUserChat(); }}
      />
      <button type="button" onClick={submitUserChat} disabled={isLoading}>submit</button>
    </div>
  );
}
