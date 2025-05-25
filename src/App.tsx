import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlanetSetup from './views/PlanetSetup';
import TradeCalculator from './views/TradeCalculator';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';

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