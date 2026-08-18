import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Without this, Turbopack falls back to guessing the workspace root from
  // whichever lockfile it finds first walking up the directory tree — on
  // this machine that's an unrelated one in the home directory, not this
  // repo's pnpm-workspace.yaml.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
