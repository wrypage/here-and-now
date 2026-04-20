import React from 'react';
import { RootLayout } from './app/_layout';
import { ChannelScreen } from './app/index';

export default function App(): React.ReactElement {
  return (
    <RootLayout>
      <ChannelScreen />
    </RootLayout>
  );
}
