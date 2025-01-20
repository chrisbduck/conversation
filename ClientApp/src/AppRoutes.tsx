import * as React from 'react';
import { CharacterChat } from "./components/CharacterChat";
import { Home } from "./components/Home";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: '/grolf-chat',
    element: <CharacterChat name="Grolf" />
  },
  {
    path: '/luthien-chat',
    element: <CharacterChat name="Luthien" />
  }
];

export default AppRoutes;
