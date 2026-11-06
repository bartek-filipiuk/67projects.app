import * as migration_20260510_104121_initial from './20260510_104121_initial';
import * as migration_20260510_162535_site_settings_branding from './20260510_162535_site_settings_branding';
import * as migration_20261106_111350_payload_3_93_upgrade from './20261106_111350_payload_3_93_upgrade';

export const migrations = [
  {
    up: migration_20260510_104121_initial.up,
    down: migration_20260510_104121_initial.down,
    name: '20260510_104121_initial',
  },
  {
    up: migration_20260510_162535_site_settings_branding.up,
    down: migration_20260510_162535_site_settings_branding.down,
    name: '20260510_162535_site_settings_branding',
  },
  {
    up: migration_20261106_111350_payload_3_93_upgrade.up,
    down: migration_20261106_111350_payload_3_93_upgrade.down,
    name: '20261106_111350_payload_3_93_upgrade'
  },
];
