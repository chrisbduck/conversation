import * as React from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export function Layout({ children }) {
  return (
    <div>
      <NavMenu />
      <Container tag="main">
        {children}
      </Container>
    </div>
  );
}
