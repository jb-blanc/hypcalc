import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import PlanetSetup from './views/PlanetSetup';
import TradeCalculator from './views/TradeCalculator';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<PlanetSetup />} />
          <Route path="/calculator" element={<TradeCalculator />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 