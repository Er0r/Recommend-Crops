import React from 'react';
import ReactDOM from 'react-dom';
import { MantineProvider } from '@mantine/core';
import App from './App';

ReactDOM.render(
  <MantineProvider
    theme={{ colorScheme: 'light' }}
    withGlobalStyles
    withNormalizeCSS
  >
    <App />
  </MantineProvider>,
  document.getElementById('root')
);
