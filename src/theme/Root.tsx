import React from 'react';
import { AuthProvider } from '../context/AuthContext';

// This component wraps the entire Docusaurus app with our providers
export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
