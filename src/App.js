import React from 'react';
import MasterPage from './master';
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

function App() {
  return (
    <Box
      className="App"
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0', // updated to a single background color
      }}
    >
      <CssBaseline />
      <MasterPage />
    </Box>
  );
}

export default App;
