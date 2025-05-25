import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { Planet, PlanetType } from '../types/planet';

const PLANET_TYPES: PlanetType[] = ['Agro', 'Minero', 'Techno'];

interface PlanetEditDialogProps {
  open: boolean;
  onClose: () => void;
  planet: Planet | null;
  onSave: (updatedPlanet: Planet) => void;
}

const PlanetEditDialog: React.FC<PlanetEditDialogProps> = ({
  open,
  onClose,
  planet,
  onSave,
}) => {
  const [editedPlanet, setEditedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    if (planet) {
      setEditedPlanet(planet);
    }
  }, [planet]);

  const handleSave = () => {
    if (editedPlanet) {
      onSave(editedPlanet);
      onClose();
    }
  };

  if (!editedPlanet) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Planet</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Planet Name"
            value={editedPlanet.name}
            onChange={(e) => setEditedPlanet({ ...editedPlanet, name: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Planet Type</InputLabel>
            <Select
              value={editedPlanet.type}
              label="Planet Type"
              onChange={(e) => setEditedPlanet({ ...editedPlanet, type: e.target.value as PlanetType })}
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
            value={editedPlanet.tradingUnits}
            onChange={(e) => setEditedPlanet({ ...editedPlanet, tradingUnits: Number(e.target.value) })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanetEditDialog; 