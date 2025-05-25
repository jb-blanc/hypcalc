import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import { Planet, PlanetType } from '../types/planet';
import TradePrioritiesDialog from '../components/TradePrioritiesDialog';
import PlanetEditDialog from '../components/PlanetEditDialog';

const PLANET_TYPES: PlanetType[] = ['Agro', 'Minero', 'Techno'];

const PlanetSetup: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>(() => {
    const saved = localStorage.getItem('planets');
    return saved ? JSON.parse(saved) : [];
  });

  const [newPlanet, setNewPlanet] = useState<Omit<Planet, 'id'>>({
    name: '',
    type: 'Agro',
    tradingUnits: 0,
    tradePriorities: [],
  });

  const [prioritiesDialogOpen, setPrioritiesDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('planets', JSON.stringify(planets));
  }, [planets]);

  const handleAddPlanet = () => {
    if (!newPlanet.name) return;

    const planet: Planet = {
      ...newPlanet,
      id: Date.now().toString(),
    };

    setPlanets([...planets, planet]);
    setNewPlanet({
      name: '',
      type: 'Agro',
      tradingUnits: 0,
      tradePriorities: [],
    });
  };

  const handleDeletePlanet = (id: string) => {
    setPlanets(planets.filter(planet => planet.id !== id));
  };

  const handleEditPlanet = (planet: Planet) => {
    setSelectedPlanet(planet);
    setEditDialogOpen(true);
  };

  const handleSaveEditedPlanet = (updatedPlanet: Planet) => {
    setPlanets(planets.map(planet => 
      planet.id === updatedPlanet.id ? updatedPlanet : planet
    ));
  };

  const handleTypeChange = (event: SelectChangeEvent<PlanetType>) => {
    setNewPlanet({
      ...newPlanet,
      type: event.target.value as PlanetType,
    });
  };

  const handleSavePriorities = (updatedPlanets: Planet[]) => {
    setPlanets(updatedPlanets);
  };

  const handleImport = () => {
    try {
      const importedPlanets = JSON.parse(importJson);
      if (Array.isArray(importedPlanets)) {
        // Validate each planet has required fields
        const validPlanets = importedPlanets.every(planet => 
          planet.name && 
          planet.type && 
          typeof planet.tradingUnits === 'number' && 
          Array.isArray(planet.tradePriorities)
        );
        
        if (validPlanets) {
          setPlanets(importedPlanets);
          setImportDialogOpen(false);
          setImportJson('');
        } else {
          alert('Invalid planet data format');
        }
      } else {
        alert('Invalid JSON format: expected an array of planets');
      }
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  const handleSaveSetup = () => {
    try {
      const setupJson = JSON.stringify(planets, null, 2);
      navigator.clipboard.writeText(setupJson).then(() => {
        setSnackbarMessage('Setup copied to clipboard!');
        setSnackbarOpen(true);
      }).catch(() => {
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarOpen(true);
      });
    } catch (error) {
      setSnackbarMessage('Failed to save setup');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Planet Setup
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveSetup}
            >
              Save Setup
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import Setup
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setPrioritiesDialogOpen(true)}
              disabled={planets.length < 2}
            >
              Manage Trade Priorities
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Planet
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Planet Name"
              value={newPlanet.name}
              onChange={(e) => setNewPlanet({ ...newPlanet, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Planet Type</InputLabel>
              <Select
                value={newPlanet.type}
                label="Planet Type"
                onChange={handleTypeChange}
              >
                {PLANET_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Trading Units"
              type="number"
              value={newPlanet.tradingUnits}
              onChange={(e) => setNewPlanet({ ...newPlanet, tradingUnits: Number(e.target.value) })}
              fullWidth
            />
          </Box>
          <Button variant="contained" onClick={handleAddPlanet}>
            Add Planet
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Your Planets
        </Typography>
        <List>
          {planets.map((planet) => (
            <ListItem
              key={planet.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleEditPlanet(planet)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeletePlanet(planet.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={planet.name}
                secondary={`Type: ${planet.type} | Trading Units: ${planet.tradingUnits} | Priority Trades: ${planet.tradePriorities.length}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <TradePrioritiesDialog
        open={prioritiesDialogOpen}
        onClose={() => setPrioritiesDialogOpen(false)}
        planets={planets}
        onSave={handleSavePriorities}
      />

      <PlanetEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedPlanet(null);
        }}
        planet={selectedPlanet}
        onSave={handleSaveEditedPlanet}
      />

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Planet Setup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paste your planet setup JSON below. The JSON should be an array of planets, each with name, type, tradingUnits, and tradePriorities.
            </Typography>
            <TextField
              multiline
              rows={10}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              fullWidth
              placeholder="Paste your JSON here..."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} variant="contained">Import</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlanetSetup; 