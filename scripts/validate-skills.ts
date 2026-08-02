import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const skillNames = [
  'offmap-product-guardrails',
  'offmap-opportunity-content',
  'offmap-release-gates',
] as const;

for (const name of skillNames) {
  const root = resolve('.codex/skills', name);
  const skill = await readFile(resolve(root, 'SKILL.md'), 'utf8');
  const manifest = await readFile(resolve(root, 'agents/openai.yaml'), 'utf8');

  if (!skill.startsWith(`---\nname: ${name}\n`)) {
    throw new Error(`${name}: SKILL.md needs matching name frontmatter`);
  }

  const description = skill.match(/^description: (.+)$/m)?.[1];
  if (!description || description.length < 40 || description.length > 1024) {
    throw new Error(`${name}: description must be between 40 and 1024 characters`);
  }

  if (!manifest.includes(`$${name}`) || !manifest.includes('allow_implicit_invocation: true')) {
    throw new Error(`${name}: openai.yaml must expose an implicit default prompt`);
  }

  await stat(resolve(root, 'references'));
}

console.log(`Validated ${skillNames.length} OffMap skills.`);
