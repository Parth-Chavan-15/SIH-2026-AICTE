import React from 'react';
import { SessionGate } from './features/auth/SessionGate';
import { CanonicalNavigation } from './features/applications/CanonicalNavigation';

export default function App() {
  return <SessionGate><CanonicalNavigation /></SessionGate>;
}
