import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hyperiums Trade Calculator
        </Typography>
        <Box>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ 
              backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              mr: 2 
            }}
          >
            Planet Setup
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/calculator')}
            sx={{ 
              backgroundColor: location.pathname === '/calculator' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Trade Calculator
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 