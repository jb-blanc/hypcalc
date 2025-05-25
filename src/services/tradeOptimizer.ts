import { Planet, TradeMatrix } from '../types/planet';

export interface MissedTrade {
  from: string;
  to: string;
  maxPossible: number;
}

export function getMutualUsedUnits(planets: Planet[], tradeMatrix: TradeMatrix, planetId: string): number {
  const planet = planets.find(p => p.id === planetId);
  if (!planet) return 0;

  // Sum up all trades where this planet is the sender
  const sent = Object.values(tradeMatrix[planetId] || {}).reduce((sum, units) => sum + units, 0);
  
  // Sum up all trades where this planet is the receiver
  const received = planets
    .filter(p => p.id !== planetId)
    .reduce((sum, p) => sum + (tradeMatrix[p.id]?.[planetId] || 0), 0);

  return sent + received;
}

export function getUnusedUnits(planets: Planet[], tradeMatrix: TradeMatrix, planetId: string, getAvailableUnits: (planetId: string) => number): number {
  const planet = planets.find(p => p.id === planetId);
  if (!planet) return 0;
  const used = getMutualUsedUnits(planets, tradeMatrix, planetId);
  return getAvailableUnits(planetId) - used;
}

export function getMissedTrades(
  planets: Planet[],
  tradeMatrix: TradeMatrix,
  getUnusedUnits: (planetId: string) => number
): MissedTrade[] {
  const missedTrades: MissedTrade[] = [];
  const handledPairs = new Set<string>();

  // Define the expected trade directions
  const tradeDirections = [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' }
  ];

  for (const { from, to } of tradeDirections) {
    const fromPlanet = planets.find(p => p.id === from);
    const toPlanet = planets.find(p => p.id === to);
    if (!fromPlanet || !toPlanet) continue;

    const fromUnused = getUnusedUnits(fromPlanet.id);
    const toUnused = getUnusedUnits(toPlanet.id);
    const maxPossible = Math.min(fromUnused, toUnused);
    
    if (maxPossible > 0) {
      missedTrades.push({
        from: fromPlanet.name,
        to: toPlanet.name,
        maxPossible
      });
    }
  }

  return missedTrades;
}

export function computeOptimized(
  planets: Planet[],
  getAvailableUnits: (planetId: string) => number,
  useMaxUnits: boolean,
  maxUnits: number
) {
  // Initialize available units for each planet
  const availableUnits: { [id: string]: number } = {};
  planets.forEach(p => {
    availableUnits[p.id] = useMaxUnits ? maxUnits : p.tradingUnits;
  });

  // Prepare trade matrix (undirected: only one direction per pair)
  const newTradeMatrix: TradeMatrix = {};
  planets.forEach(p => { newTradeMatrix[p.id] = {}; });

  // Helper to get all valid pairs (A, B) with A.id < B.id and different types
  const getValidPairs = () => {
    const pairs: { a: Planet; b: Planet }[] = [];
    for (let i = 0; i < planets.length; ++i) {
      for (let j = i + 1; j < planets.length; ++j) {
        const a = planets[i];
        const b = planets[j];
        if (a.type !== b.type) {
          pairs.push({ a, b });
        }
      }
    }
    return pairs;
  };

  const pairs = getValidPairs();
  const traded: { [key: string]: { [key: string]: number } } = {};
  planets.forEach(p => { traded[p.id] = {}; });

  // Fair-share among mutual priorities
  pairs.forEach(({ a, b }) => {
    const aPrior = a.tradePriorities.includes(b.id);
    const bPrior = b.tradePriorities.includes(a.id);
    if (aPrior || bPrior) {
      const maxTrade = Math.min(availableUnits[a.id], availableUnits[b.id]);
      if (maxTrade > 0) {
        const aFair = aPrior ? Math.floor(availableUnits[a.id] / a.tradePriorities.length) : 0;
        const bFair = bPrior ? Math.floor(availableUnits[b.id] / b.tradePriorities.length) : 0;
        const fairTrade = Math.max(0, Math.min(maxTrade, aFair, bFair));
        if (fairTrade > 0) {
          traded[a.id][b.id] = fairTrade;
          traded[b.id][a.id] = fairTrade;
          availableUnits[a.id] -= fairTrade;
          availableUnits[b.id] -= fairTrade;
        }
      }
    }
  });

  // Distribute remaining units to any valid partner
  pairs.forEach(({ a, b }) => {
    const already = traded[a.id][b.id] || 0;
    const maxTrade = Math.min(availableUnits[a.id], availableUnits[b.id]);
    if (maxTrade > 0) {
      traded[a.id][b.id] = already + maxTrade;
      traded[b.id][a.id] = already + maxTrade;
      availableUnits[a.id] -= maxTrade;
      availableUnits[b.id] -= maxTrade;
    }
  });

  planets.forEach((from: Planet) => {
    planets.forEach((to: Planet) => {
      if (from.id !== to.id && from.type !== to.type) {
        if (from.id < to.id) {
          newTradeMatrix[from.id][to.id] = traded[from.id][to.id] || 0;
        } else {
          newTradeMatrix[from.id][to.id] = 0;
        }
      }
    });
  });
  return { newPlanets: planets, newTradeMatrix };
}

export function calculateOptimalTrades(
  planets: Planet[],
  useMaxUnits: boolean,
  maxUnits: number,
  setTradeMatrix: React.Dispatch<React.SetStateAction<TradeMatrix>>,
  setFairShareDebug: React.Dispatch<React.SetStateAction<{ [fromId: string]: { [toId: string]: number; }; }>>
) {
  // Initialize available units for each planet
  const availableUnits: { [id: string]: number } = {};
  planets.forEach(p => {
    availableUnits[p.id] = useMaxUnits ? maxUnits : p.tradingUnits;
  });

  // Prepare trade matrix (undirected: only one direction per pair)
  const newTradeMatrix: TradeMatrix = {};
  planets.forEach(p => { newTradeMatrix[p.id] = {}; });

  // Helper to get all valid pairs (A, B) with A.id < B.id and different types
  const getValidPairs = () => {
    const pairs: { a: Planet; b: Planet }[] = [];
    for (let i = 0; i < planets.length; ++i) {
      for (let j = i + 1; j < planets.length; ++j) {
        const a = planets[i];
        const b = planets[j];
        if (a.type !== b.type) {
          pairs.push({ a, b });
        }
      }
    }
    return pairs;
  };

  // 1. Fair-share among priorities
  // For each planet, try to distribute units as evenly as possible among its priorities
  const pairs = getValidPairs();
  // Track how much has been traded between each pair
  const traded: { [key: string]: { [key: string]: number } } = {};
  planets.forEach(p => { traded[p.id] = {}; });

  // Track fair-share trades for debug visualization
  const fairShareTrades: { [fromId: string]: { [toId: string]: number } } = {};
  planets.forEach(p => { fairShareTrades[p.id] = {}; });

  // First pass: fair-share among mutual priorities
  pairs.forEach(({ a, b }) => {
    const aPrior = a.tradePriorities.includes(b.id);
    const bPrior = b.tradePriorities.includes(a.id);
    if (aPrior || bPrior) {
      // Both are priorities for each other or one-way
      // Fair-share: split available units as evenly as possible
      const maxTrade = Math.min(availableUnits[a.id], availableUnits[b.id]);
      if (maxTrade > 0) {
        // For fair-share, divide units equally among all priorities
        // Each planet divides its available units among its priorities
        const aFair = aPrior ? Math.floor(availableUnits[a.id] / a.tradePriorities.length) : 0;
        const bFair = bPrior ? Math.floor(availableUnits[b.id] / b.tradePriorities.length) : 0;
        const fairTrade = Math.max(0, Math.min(maxTrade, aFair, bFair));
        if (fairTrade > 0) {
          traded[a.id][b.id] = fairTrade;
          traded[b.id][a.id] = fairTrade;
          availableUnits[a.id] -= fairTrade;
          availableUnits[b.id] -= fairTrade;
          // Track for debug
          if (aPrior) fairShareTrades[a.id][b.id] = fairTrade;
          if (bPrior) fairShareTrades[b.id][a.id] = fairTrade;
        }
      }
    }
  });

  // Second pass: distribute remaining units to any valid partner
  pairs.forEach(({ a, b }) => {
    const already = traded[a.id][b.id] || 0;
    const maxTrade = Math.min(availableUnits[a.id], availableUnits[b.id]);
    if (maxTrade > 0) {
      traded[a.id][b.id] = already + maxTrade;
      traded[b.id][a.id] = already + maxTrade;
      availableUnits[a.id] -= maxTrade;
      availableUnits[b.id] -= maxTrade;
    }
  });

  // Fill trade matrix (directional for display, but only one direction per pair)
  planets.forEach((from: Planet) => {
    planets.forEach((to: Planet) => {
      if (from.id !== to.id && from.type !== to.type) {
        // Only fill one direction (from.id < to.id)
        if (from.id < to.id) {
          newTradeMatrix[from.id][to.id] = traded[from.id][to.id] || 0;
        } else {
          newTradeMatrix[from.id][to.id] = 0;
        }
      }
    });
  });
  setTradeMatrix(newTradeMatrix);
  // Save fair-share trades for debug
  setFairShareDebug(fairShareTrades);
} 