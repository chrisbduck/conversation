import React, { Component } from 'react';

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

export class CharacterChat extends Component {
  static displayName = CharacterChat.name;

  state: IChatState = {
    history: [],
    error: '',
    loading: true
  };
  userText: string;
  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.userText = '';
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.populateChatData();
  }

  render() {
    const contents = this.state.loading || this.state.error
      ? <p><b>{this.state.error || "Loading..."}</b></p>
      : this.state.history.map(msg => <p key={msg.key}>{
          msg.chatType == ChatType.User ? <em>{msg.text}</em> : msg.text
        }</p>);

    return (
      <div>
        <h1>Conversation</h1>
        {contents}
        Say something:
        <input name="userQuery" ref={this.inputRef}
          onChange={event => this.setUserText(event.target.value)}
          disabled={this.state.loading}
        />
        <button type="button" onClick={() => this.submitUserChat()} disabled={this.state.loading}>submit</button>
      </div>
    );
  }

  setUserText(text: string) {
    this.userText = text;
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

  async populateChatData() {
    const response = await fetch('chat');
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
    const chatHistory = this.state.history.map(msg => {
      return {
        type: msg.chatType,
        text: msg.text
      };
    });
    const historyText = JSON.stringify(chatHistory);
    const response = await fetch('chat', {
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
