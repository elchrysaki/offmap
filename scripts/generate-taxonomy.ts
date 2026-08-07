import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import YAML from 'yaml';

type RawCategory = {
  title: string;
  emoji: string;
  route: string;
  description: string;
};

type RawMainCategory = {
  title: string;
  emoji: string;
  description: string;
  categories: Record<string, RawCategory>;
};

const sourcePath = resolve('config/categories.yml');
const outputPath = resolve('packages/taxonomy/src/catalog.generated.json');
const source = YAML.parse(await readFile(sourcePath, 'utf8')) as {
  main_categories?: Record<string, RawMainCategory>;
};

if (!source.main_categories || Object.keys(source.main_categories).length === 0) {
  throw new Error('config/categories.yml does not contain main_categories');
}

await writeFile(outputPath, `${JSON.stringify(source.main_categories, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputPath} from ${sourcePath}.`);
