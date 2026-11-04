import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('cartridge version', () => {
  it('matches package.json, since package.json never reaches an instance', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(require('../cartridges/plugin_superpilot/cartridge/scripts/superpilot/version.js')).toBe(
      pkg.version
    );
  });
});
