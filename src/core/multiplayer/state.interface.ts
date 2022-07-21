import { Test } from '../generate-test';

export type GameState = {
  peers: { id: string; index: number }[];
  test: Test;
};

export type ClientIndexMessage = {
  type: 'index';
  data: number;
};
