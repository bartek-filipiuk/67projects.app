import * as migration_20260510_104121_initial from './20260510_104121_initial';

export const migrations = [
  {
    up: migration_20260510_104121_initial.up,
    down: migration_20260510_104121_initial.down,
    name: '20260510_104121_initial'
  },
];
