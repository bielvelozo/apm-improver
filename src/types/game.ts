export interface Row {
  id: number;
  cells: { [key: number]: string };
}

export interface ActiveKey {
  letter: string;
  row: number;
  cell: number;
}

export type GameState = 'menu' | 'playing';
