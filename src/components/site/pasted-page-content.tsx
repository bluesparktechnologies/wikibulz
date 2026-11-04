import type { ReactNode } from "react";

type PastedPageContentProps = {
  text: string;
  title: string;
  h2: string[];
  h3?: string[];
};

export function PastedPageContent({ text, title, h2, h3 = [] }: PastedPageContentProps) {
  const h2Set = new Set(h2);
  const h3Set = new Set(h3);
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  let contentBlocks = blocks;
  if (blocks[0] === title) {
    contentBlocks = blocks.slice(1);
  } else if (blocks[0]?.startsWith(`${title} `)) {
    contentBlocks = [blocks[0].slice(title.length).trim(), ...blocks.slice(1)];
  }

  return <>
    {contentBlocks.map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const firstLine = lines[0];
      const rest = lines.slice(1);
      let node: ReactNode;

      if (h2Set.has(firstLine)) {
        node = <><h2>{firstLine}</h2>{rest.length > 1 ? <ul>{rest.map((line) => <li key={line}>{line}</li>)}</ul> : rest.map((line) => <p key={line}>{line}</p>)}</>;
      } else if (h3Set.has(firstLine)) {
        node = <><h3>{firstLine}</h3>{rest.length > 1 ? <ul>{rest.map((line) => <li key={line}>{line}</li>)}</ul> : rest.map((line) => <p key={line}>{line}</p>)}</>;
      } else if (lines.length > 1) {
        node = <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>;
      } else {
        node = <p>{firstLine}</p>;
      }

      return <div key={`${index}-${firstLine}`}>{node}</div>;
    })}
  </>;
}
