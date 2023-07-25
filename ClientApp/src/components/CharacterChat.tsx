import React, { Component, ComponentProps } from 'react';
import { ContainerProps } from 'reactstrap';

enum ChatType { Character, User };

interface IMessage {
  chatType: ChatType;
  text: string;
  key: string;
};

interface IChatState {
  history: IMessage[];
  error: string;
  loading: boolean;
}

interface ICharacterChatProps extends ContainerProps {
  name: string;
};

export class CharacterChat extends Component<ICharacterChatProps> {
  static displayName = CharacterChat.name;
  state: IChatState;
  userText: string;
  inputRef: React.RefObject<HTMLInputElement>;
  characterName: string;

  constructor(props: ICharacterChatProps) {
    super(props);
    this.state = {
      history: [],
      error: '',
      loading: true
    };
    this.userText = '';
    this.inputRef = React.createRef();
    this.characterName = props.name;
  }

  componentDidMount() {
    this.populateInitialPrompt();
  }

  getTextContents() {
    if (this.state.error)
      return <p><b>{this.state.error}</b></p>;
    
    const loadingElement = this.state.loading ? <p><b><i>Waiting for {this.characterName}...</i></b></p> : <span/>;
    const contents = <div>
      {this.state.history.map(msg => {
        return msg.chatType == ChatType.User
          ? <blockquote key={msg.key}><b>You:</b> {msg.text}</blockquote>
          : <p key={msg.key}><b>{this.characterName}:</b> {msg.text}</p>;
      })}
      {loadingElement}
    </div>
    return contents;
  }

  render() {
    const contents = this.getTextContents();

    return (
      <div className="bottom-padded">
        <h1>Conversation</h1>
        <img src={this.characterName.toLowerCase() + ".jpg"} className="resized-image" />
        {contents}
        <b>Say something:</b>
        <input name="userQuery" ref={this.inputRef}
          onChange={event => this.setUserText(event.target.value)}
          onKeyDown={event => this.handleKeyDown(event)}
          disabled={this.state.loading}
        />
        <button type="button" onClick={() => this.submitUserChat()} disabled={this.state.loading}>submit</button>
      </div>
    );
  }

  setUserText(text: string) {
    this.userText = text;
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      this.submitUserChat();
    }
  }

  setError(text: string) {
    this.setState({error: text, loading: false});
  }

  addChatMessage(type: ChatType, text: string) {
    let state = this.state;
    state.history.push({chatType: type, text: text, key: state.history.length.toString()});
    state.loading = false;
    this.setState(state);
  }

  setLoading() {
    this.setState({loading: true});
  }

  async populateInitialPrompt() {
    const response = await fetch(`chat?name=${this.characterName}`);
    const data = await response.json();
    if (!response.ok) {
      this.setError(response.statusText);
      return;
    }
    this.addChatMessage(ChatType.Character, data);
  }

  submitUserChat() {
    const userText = this.userText.trim();
    const element = this.inputRef.current;
    element.value = '';
    this.addChatMessage(ChatType.User, userText);
    this.requestCharacterResponse();
  }

  async requestCharacterResponse() {
    this.setLoading();
    const chatHistory = this.state.history.map(msg => {
      return {
        type: msg.chatType,
        text: msg.text
      };
    });
    const historyText = JSON.stringify(chatHistory);
    const response = await fetch(`chat?name=${this.characterName}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: historyText
    });
    const data = await response.json();
    if (!response.ok) {
      this.setError(response.statusText);
      return;
    }
    this.addChatMessage(ChatType.Character, data);
  }
}
