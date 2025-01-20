import React from 'react';
import { GrolfImgSrc, LuthienImgSrc } from '../Shared';

export function Home() {
  return (
    <div>
      <h1>Character Conversations</h1>
      <p>This page is an experiment with the OpenAI API that lets you have open-ended conversations with
        fantasy RPG characters.  Source code is <a href="https://github.com/chrisbduck/conversation">here</a>.</p>
      <table>
        <tbody>
          <tr>
            <td><img src={GrolfImgSrc} height="300px" /></td>
            <td><img src={LuthienImgSrc} height="300px" /></td>
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
