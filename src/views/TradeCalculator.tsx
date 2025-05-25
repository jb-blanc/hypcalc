import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import MemoryIcon from '@mui/icons-material/Memory';
import LandscapeIcon from '@mui/icons-material/Landscape';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Planet, TradeMatrix } from '../types/planet';
import PlanetTradeCardsView from '../components/PlanetTradeCardsView';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getMutualUsedUnits, getUnusedUnits, getMissedTrades, calculateOptimalTrades } from '../services/tradeOptimizer';

const TradeCalculator: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>(() => {
    const saved = localStorage.getItem('planets');
    return saved ? JSON.parse(saved) : [];
  });
  const [tradeMatrix, setTradeMatrix] = useState<TradeMatrix>({});
  const [maxUnits, setMaxUnits] = useState<number>(0);
  const [useMaxUnits, setUseMaxUnits] = useState<boolean>(false);
  const [fairShareDebug, setFairShareDebug] = useState<{ [fromId: string]: { [toId: string]: number } }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlanet, setEditingPlanet] = useState<Planet | null>(null);
  const [editUnits, setEditUnits] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  useEffect(() => {
    const savedPlanets = localStorage.getItem('planets');
    if (savedPlanets) {
      setPlanets(JSON.parse(savedPlanets));
    }
  }, []);

  const getAvailableUnits = (planetId: string) => {
    const planet = planets.find(p => p.id === planetId);
    if (!planet) return 0;
    return useMaxUnits ? maxUnits : planet.tradingUnits;
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(tradeMatrix, null, 2);
    navigator.clipboard.writeText(text);
  };

  const getPlanetTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'agro':
        return <GrassIcon sx={{ color: 'green' }} />;
      case 'techno':
        return <MemoryIcon sx={{ color: 'blue' }} />;
      case 'minero':
        return <LandscapeIcon sx={{ color: 'brown' }} />;
      default:
        return null;
    }
  };

  // Helper to get unused units for suggestion logic
  const getUnusedForSuggestions = (planetId: string) => {
    const planet = planets.find(p => p.id === planetId);
    if (!planet) return 0;
    const used = getMutualUsedUnits(planets, tradeMatrix, planetId);
    return getAvailableUnits(planetId) - used;
  };

  const handleEditClick = (planet: Planet) => {
    setEditingPlanet(planet);
    setEditUnits(useMaxUnits ? maxUnits : planet.tradingUnits);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingPlanet) {
      const updatedPlanets = planets.map(p => 
        p.id === editingPlanet.id ? { ...p, tradingUnits: editUnits } : p
      );
      setPlanets(updatedPlanets);
      // Recalculate optimal trades after updating
      calculateOptimalTrades(updatedPlanets, useMaxUnits, maxUnits, setTradeMatrix, setFairShareDebug);
    }
    setEditDialogOpen(false);
  };

  const handleImportTrades = () => {
    try {
      const importedTrades = JSON.parse(importJson);
      if (typeof importedTrades === 'object' && importedTrades !== null) {
        // Validate the trade matrix structure
        const isValid = Object.entries(importedTrades).every(([fromId, toPlanets]) => {
          if (typeof toPlanets !== 'object' || toPlanets === null) return false;
          return Object.entries(toPlanets).every(([toId, amount]) => {
            return typeof amount === 'number' && amount >= 0;
          });
        });

        if (isValid) {
          setTradeMatrix(importedTrades);
          setImportDialogOpen(false);
          setImportJson('');
          setSnackbarMessage('Trade structure imported successfully!');
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage('Invalid trade structure format');
          setSnackbarOpen(true);
        }
      } else {
        setSnackbarMessage('Invalid JSON format: expected a trade matrix object');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Invalid JSON format');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        mt: 4,
        maxWidth: '95% !important',
        width: '95%'
      }}
    >
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Trade Calculator
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import Trades
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={copyToClipboard}
            >
              Copy to Clipboard
            </Button>
          </Box>
        </Box>

        {/* Planet Trade Cards Accordion */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Planet Trade Cards View</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PlanetTradeCardsView
              planets={planets}
              tradeMatrix={tradeMatrix}
              getPlanetTypeIcon={getPlanetTypeIcon}
              getAvailableUnits={getAvailableUnits}
            />
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useMaxUnits}
                onChange={(e) => setUseMaxUnits(e.target.checked)}
              />
            }
            label="Use Global Max Units"
          />
          {useMaxUnits && (
            <TextField
              label="Max Units per Planet"
              type="number"
              value={maxUnits}
              onChange={(e) => setMaxUnits(Number(e.target.value))}
              sx={{ ml: 2 }}
            />
          )}
          <Tooltip title="Calculates optimal trades by maximizing units with priority planets first, then maximizing remaining units with other possible trade partners">
            <Button
              variant="contained"
              onClick={(event) => calculateOptimalTrades(planets, useMaxUnits, maxUnits, setTradeMatrix, setFairShareDebug)}
              sx={{ ml: 2 }}
            >
              Calculate Optimal Trades
            </Button>
          </Tooltip>
        </Box>

        {/* Main content: Table and Suggestions side by side */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Trade Table */}
          <Box sx={{ flex: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Planet</TableCell>
                    {planets.map(planet => (
                      <TableCell key={planet.id} align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getPlanetTypeIcon(planet.type)}
                            <Typography variant="body1">{planet.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {getAvailableUnits(planet.id)}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(planet)}
                              sx={{ ml: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planets.map(planet => (
                    <TableRow key={planet.id}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getPlanetTypeIcon(planet.type)}
                          <Typography variant="body1">{planet.name}</Typography>
                        </Box>
                      </TableCell>
                      {planets.map(targetPlanet => (
                        <TableCell key={targetPlanet.id} align="center">
                          {planet.id === targetPlanet.id ? '-' : 
                           planet.type === targetPlanet.type ? '-' :
                           tradeMatrix[planet.id]?.[targetPlanet.id] || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Suggestions Panel */}
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Paper sx={{ p: 2, height: '100%', background: '#232323' }}>
              <Typography variant="h6" gutterBottom color="primary">Trade Analysis</Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Unused Units</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <ul style={{ paddingLeft: 18 }}>
                      {planets.map(planet => (
                        <li key={planet.id}>
                          {getPlanetTypeIcon(planet.type)} <b>{planet.name}</b>: {getUnusedUnits(planets, tradeMatrix, planet.id, getAvailableUnits)}
                        </li>
                      ))}
                    </ul>
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Missed Trades</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <ul style={{ paddingLeft: 18 }}>
                      {getMissedTrades(planets, tradeMatrix, getUnusedForSuggestions).length === 0 ? (
                        <li>No missed trades found!</li>
                      ) : (
                        getMissedTrades(planets, tradeMatrix, getUnusedForSuggestions).map(trade => (
                          <li key={`${trade.from}-${trade.to}`}>
                            {trade.from} → {trade.to}: {trade.maxPossible} units
                          </li>
                        ))
                      )}
                    </ul>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>
        </Box>
      </Paper>
      {/* Debug Panel */}
      <Paper sx={{ p: 2, mt: 3, background: '#222' }}>
        <Typography variant="h6" gutterBottom color="primary">Debug Panel</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          {/* Fair-Share Distribution Column */}
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="subtitle1">Fair-Share Distribution (Priority Trades):</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Planet</TableCell>
                    <TableCell>Priority Partner</TableCell>
                    <TableCell align="right">Fair-Share Units</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planets.flatMap(planet =>
                    planet.tradePriorities.map(pid => {
                      const partner = planets.find(p => p.id === pid);
                      if (!partner) return null;
                      const units = fairShareDebug[planet.id]?.[partner.id] || 0;
                      return (
                        <TableRow key={planet.id + '-' + partner.id}>
                          <TableCell>{getPlanetTypeIcon(planet.type)} {planet.name}</TableCell>
                          <TableCell>{getPlanetTypeIcon(partner.type)} {partner.name}</TableCell>
                          <TableCell align="right">{units}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Available Units</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Available Units"
              type="number"
              value={editUnits}
              onChange={(e) => setEditUnits(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Trade Structure</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paste your trade structure JSON below. The JSON should be an object where keys are planet IDs and values are objects mapping destination planet IDs to trade amounts.
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
          <Button onClick={handleImportTrades} variant="contained">Import</Button>
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

export default TradeCalculator; 