import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReactNode } from 'react';

// Deliberately not a general markdown engine — docs/legal/*.md only ever
// uses headings, **bold**, bullet lists, and simple pipe tables, so a
// full parser (and the dependency it'd need) would be more than this
// needs. If the legal docs grow more complex markdown, extend this
// rather than reaching for a library.

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function renderTable(lines: string[], key: number) {
  const rows = lines
    .filter((line) => !/^\|[\s-]+\|/.test(line))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
  const [head, ...body] = rows;
  if (!head) return null;

  return (
    <div key={key} className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                className="border-b-2 px-3 py-2 text-left font-bold"
                style={{ borderColor: 'var(--ink)' }}
              >
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: 'var(--rule)' }}
                >
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function renderLegalDoc(
  relativePath: string,
): Promise<{ title: string; body: ReactNode }> {
  const raw = await readFile(path.join(process.cwd(), relativePath), 'utf8');
  const lines = raw.split('\n');

  let title = '';
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={key++} className="mt-4 text-[15px] leading-relaxed">
          {parseInline(paragraph.join(' '))}
        </p>,
      );
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="mt-3 ml-5 list-disc space-y-1.5 text-[15px] leading-relaxed">
          {list.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2
          key={key++}
          className="font-[family-name:var(--font-fraunces)] mt-9 text-xl font-extrabold"
        >
          {line.slice(3).trim()}
        </h2>,
      );
      continue;
    }
    if (line.startsWith('|')) {
      flushParagraph();
      flushList();
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        tableLines.push(lines[i] as string);
        i++;
      }
      i--;
      blocks.push(renderTable(tableLines, key++));
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();

  return { title, body: <>{blocks}</> };
}
