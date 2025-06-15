import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Question from './pages/Question';
import Results from './pages/Results';
import CheckResults from './pages/CheckResults';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:questionNumber" element={<Question />} />
          <Route path="/results" element={<Results />} />
          <Route path="/check-results" element={<CheckResults />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
