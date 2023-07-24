import React, { Component } from 'react';

export class CharacterChat extends Component {
  static displayName = CharacterChat.name;
  state = {
    chatText: '',
    loading: true
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.populateChatData();
  }

  render() {
    const contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : <p>{this.state.chatText}</p>;

    return (
      <div>
        <h1 id="tableLabel">ChatGPT's joke</h1>
        {contents}
      </div>
    );
  }

  async populateChatData() {
    const response = await fetch('chat?query=hello');
    const data = await response.json();
    if (!response.ok) {
      this.setState({ chatText: response.statusText, loading: false });
      return;
    }
    this.setState({ chatText: data, loading: false });
  }
}
