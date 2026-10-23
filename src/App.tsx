import React from 'react';
import { SessionGate } from './features/auth/SessionGate';
import { CanonicalWorkspace } from './features/applications/CanonicalWorkspace';

export default function App() {
  return <SessionGate><CanonicalWorkspace /></SessionGate>;
}
