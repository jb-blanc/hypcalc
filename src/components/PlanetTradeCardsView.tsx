import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, Table, TableBody, TableCell, TableRow, Box } from '@mui/material';
import { Planet, TradeMatrix } from '../types/planet';

interface PlanetTradeCardsViewProps {
  planets: Planet[];
  tradeMatrix: TradeMatrix;
  getPlanetTypeIcon: (type: string) => React.ReactNode;
  getAvailableUnits: (planetId: string) => number;
}

const PlanetTradeCardsView: React.FC<PlanetTradeCardsViewProps> = ({ planets, tradeMatrix, getPlanetTypeIcon, getAvailableUnits }) => {
  return (
    <Grid container spacing={2}>
      {planets.map(planet => (
        <Grid item xs={12} sm={6} md={4} lg={2.4} key={planet.id}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<Box sx={{ display: 'flex', alignItems: 'center' }}>{getPlanetTypeIcon(planet.type)}</Box>}
              title={<Typography variant="h6">{planet.name}</Typography>}
              subheader={<Typography variant="body2" color="text.secondary">{planet.type} &bull; Available: {getAvailableUnits(planet.id)}</Typography>}
            />
            <CardContent sx={{ p: 2 }}>
              <Table size="small">
                <TableBody>
                  {planets.filter(p => p.id !== planet.id && planet.type !== p.type).map(partner => {
                    // Only show if there is a trade
                    const units = planet.id < partner.id
                      ? tradeMatrix[planet.id]?.[partner.id] || 0
                      : tradeMatrix[partner.id]?.[planet.id] || 0;
                    if (units === 0) return null;
                    return (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getPlanetTypeIcon(partner.type)}
                            <Typography variant="body2">{partner.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{units}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PlanetTradeCardsView; 