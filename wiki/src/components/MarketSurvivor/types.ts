export type AssetClass = 'stocks' | 'bonds' | 'gold' | 'cash' | 'realestate';

export interface AssetAllocation {
  stocks: number;
  bonds: number;
  gold: number;
  cash: number;
  realestate: number;
}

export interface Scenario {
  id: number;
  year: string;
  title: string;
  period: string;
  headline: string;
  description: string;
  marketContext: string;
  returns: AssetAllocation;
  bestAllocation: AssetAllocation;
  actualOutcome: string;
  explanation: string;
}

export interface RoundResult {
  scenarioId: number;
  allocation: AssetAllocation;
  portfolioChange: number;
  portfolioAfter: number;
  returns: AssetAllocation;
}

export interface Ranking {
  title: string;
  grade: string;
  description: string;
  minReturn: number;
}

export const ASSET_LABELS: Record<AssetClass, string> = {
  stocks: '주식',
  bonds: '채권',
  gold: '금',
  cash: '현금',
  realestate: '부동산',
};

export const ASSET_COLORS: Record<AssetClass, string> = {
  stocks: '#e74c3c',
  bonds: '#3498db',
  gold: '#f1c40f',
  cash: '#95a5a6',
  realestate: '#9b59b6',
};

export const ASSET_CLASSES: AssetClass[] = ['stocks', 'bonds', 'gold', 'cash', 'realestate'];

export const INITIAL_CAPITAL = 100_000_000;
export const ROUNDS_PER_GAME = 10;
