import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
} from '@mui/material';
import { Planet } from '../types/planet';

interface TradePrioritiesDialogProps {
  open: boolean;
  onClose: () => void;
  planets: Planet[];
  onSave: (updatedPlanets: Planet[]) => void;
}

const TradePrioritiesDialog: React.FC<TradePrioritiesDialogProps> = ({
  open,
  onClose,
  planets,
  onSave,
}) => {
  const [localPlanets, setLocalPlanets] = useState<Planet[]>(planets);

  // Update local state when dialog opens or planets change
  useEffect(() => {
    if (open) {
      setLocalPlanets(planets);
    }
  }, [open, planets]);

  const handlePriorityChange = (planetId: string, targetPlanetId: string, checked: boolean) => {
    setLocalPlanets(prevPlanets => {
      return prevPlanets.map(planet => {
        if (planet.id === planetId) {
          const newPriorities = checked
            ? [...planet.tradePriorities, targetPlanetId]
            : planet.tradePriorities.filter(id => id !== targetPlanetId);
          return { ...planet, tradePriorities: newPriorities };
        }
        return planet;
      });
    });
  };

  const handleSave = () => {
    onSave(localPlanets);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Trade Priorities</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the planets you want to prioritize trading with for each planet.
          The order of selection determines the priority (first selected = highest priority).
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Planet</TableCell>
                {planets.map(planet => (
                  <TableCell key={planet.id} align="center">
                    {planet.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {planets.map(planet => (
                <TableRow key={planet.id}>
                  <TableCell component="th" scope="row">
                    {planet.name}
                  </TableCell>
                  {planets.map(targetPlanet => (
                    <TableCell key={targetPlanet.id} align="center">
                      {planet.id === targetPlanet.id ? (
                        '-'
                      ) : planet.type === targetPlanet.type ? (
                        'Same Type'
                      ) : (
                        <Checkbox
                          checked={localPlanets.find(p => p.id === planet.id)?.tradePriorities.includes(targetPlanet.id) || false}
                          onChange={(e) => handlePriorityChange(planet.id, targetPlanet.id, e.target.checked)}
                          disabled={planet.type === targetPlanet.type}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Priorities
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradePrioritiesDialog; 