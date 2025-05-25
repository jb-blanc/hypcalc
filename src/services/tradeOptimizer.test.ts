import { Planet, TradeMatrix } from "../types/planet";
import { 
  getMutualUsedUnits, 
  getUnusedUnits, 
  getMissedTrades,
} from "./tradeOptimizer";
import { expect } from '@jest/globals';

describe('Trade Optimizer Service', () => {
  // Sample data
  const mockPlanets: Planet[] = [
    {
      id: 'A',
      name: 'Planet A',
      type: 'Agro',
      tradingUnits: 100,
      tradePriorities: []
    },
    {
      id: 'B',
      name: 'Planet B',
      type: 'Techno',
      tradingUnits: 100,
      tradePriorities: []
    },
    {
      id: 'C',
      name: 'Planet C',
      type: 'Minero',
      tradingUnits: 100,
      tradePriorities: []
    }
  ];

  const mockTradeMatrix: TradeMatrix = {
    'A': { 'C': 50 },  // A sends 50 to C
    'B': { 
      'A': 10,  // B sends 10 to A
      'C': 15   // B sends 15 to C
    },
    'C': {}     // C doesn't send to anyone
  };

  const mockGetAvailableUnits = (planetId: string) => {
    const planet = mockPlanets.find(p => p.id === planetId);
    return planet ? planet.tradingUnits : 0;
  };

  describe('getMutualUsedUnits', () => {
    it('should calculate mutual used units correctly', () => {
      // Planet A: sends 50 to C, receives 10 from B = 60 used
      const usedUnitsA = getMutualUsedUnits(mockPlanets, mockTradeMatrix, 'A');
      expect(usedUnitsA).toBe(60);

      // Planet B: sends 10 to A and 15 to C = 25 used
      const usedUnitsB = getMutualUsedUnits(mockPlanets, mockTradeMatrix, 'B');
      expect(usedUnitsB).toBe(25);

      // Planet C: receives 50 from A and 15 from B = 65 used
      const usedUnitsC = getMutualUsedUnits(mockPlanets, mockTradeMatrix, 'C');
      expect(usedUnitsC).toBe(65);
    });
  });

  describe('getUnusedUnits', () => {
    it('should calculate unused units correctly', () => {
      const unusedUnitsA = getUnusedUnits(mockPlanets, mockTradeMatrix, 'A', mockGetAvailableUnits);
      expect(unusedUnitsA).toBe(40);  // 100 - 60 = 40

      const unusedUnitsB = getUnusedUnits(mockPlanets, mockTradeMatrix, 'B', mockGetAvailableUnits);
      expect(unusedUnitsB).toBe(75);  // 100 - 25 = 75

      const unusedUnitsC = getUnusedUnits(mockPlanets, mockTradeMatrix, 'C', mockGetAvailableUnits);
      expect(unusedUnitsC).toBe(35);  // 100 - 65 = 35
    });
  });

  describe('getMissedTrades', () => {
    it('should identify missed trades', () => {
      const mockGetUnused = (planetId: string) => {
        const planet = mockPlanets.find(p => p.id === planetId);
        if (!planet) return 0;
        const used = getMutualUsedUnits(mockPlanets, mockTradeMatrix, planetId);
        return planet.tradingUnits - used;
      };

      const missedTrades = getMissedTrades(mockPlanets, mockGetUnused);
      
      // Expected missed trades:
      // A could trade with B (A has 40 unused, B has 75 unused)
      // B could trade with C (B has 75 unused, C has 35 unused)
      // C could trade with A (C has 35 unused, A has 40 unused)

      expect(missedTrades.length).toBe(3);
      expect(missedTrades).toEqual(expect.arrayContaining([
        { from: 'Planet A', to: 'Planet B', maxPossible: 40 },
        { from: 'Planet B', to: 'Planet C', maxPossible: 35 },
        { from: 'Planet C', to: 'Planet A', maxPossible: 35 }
      ]));
    });
  });
}); 