export type PlanetType = 'Agro' | 'Minero' | 'Techno';

export interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  tradingUnits: number;
  tradePriorities: string[]; // Array of planet IDs in order of priority
}

export interface Trade {
  fromPlanetId: string;
  toPlanetId: string;
  units: number;
}

export interface TradeMatrix {
  [planetId: string]: {
    [targetPlanetId: string]: number;
  };
} 