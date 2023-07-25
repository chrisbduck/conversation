import React, { Component } from 'react';

export class Home extends Component {
  static displayName = Home.name;

  render() {
    return (
      <div>
        <h1>Character Conversations</h1>
        <p>This page is an experiment with the OpenAI API that lets you have open-ended conversations with
          fantasy RPG characters.</p>
        <table>
          <tbody>
            <tr>
              <td><img src="Grolf.jpg" height="300px" /></td>
              <td><img src="Luthien.jpg" height="300px" /></td>
            </tr>
            <tr>
              <td><a href="/grolf-chat">Grolf</a> the dwarven blacksmith</td>
              <td><a href="/luthien-chat">Luthien</a> the elven warrior</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
