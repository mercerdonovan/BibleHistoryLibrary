import { blockAnchor } from "@/lib/block-anchor";
import type { TextRun, TractBlock, TractSection } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders the canonical tract text.
 *
 * Wording comes straight from content/tracts/<slug>.json. This component
 * only decides how each printed element is typeset; it never adds, removes
 * or reorders words. Where a run is split (the question number, the "Note:"
 * label, the scripture reference) the pieces are rendered back to back so
 * the text reads, selects and copies exactly as printed.
 */

function Run({ run }: { run: TextRun }) {
  let node: React.ReactNode = run.text;
  if (run.underline) node = <span className="t-u">{node}</span>;
  if (run.italic) node = <i>{node}</i>;
  if (run.bold) node = <b>{node}</b>;
  if (run.small) node = <span className="t-small">{node}</span>;
  return node;
}

function Runs({ runs }: { runs: TextRun[] }) {
  return runs.map((run, index) => <Run key={index} run={run} />);
}

const QUESTION_NUMBER = /^\d+\.?/;

function Question({ block }: { block: TractBlock }) {
  // The whole line is bold in print; weight is carried by the heading style.
  const text = block.runs.map((run) => run.text).join("");
  const number = QUESTION_NUMBER.exec(text)?.[0] ?? "";
  return (
    <>
      {number ? <span className="t-qnum">{number}</span> : null}
      {text.slice(number.length)}
    </>
  );
}

function Scripture({ block }: { block: TractBlock }) {
  const [reference, ...rest] = block.runs;
  if (!reference) return null;
  return (
    <>
      <span className="t-ref">{reference.text}</span>
      <Runs runs={rest} />
    </>
  );
}

function Note({ block }: { block: TractBlock }) {
  const [label, ...rest] = block.runs;
  if (!label) return null;
  // Only a short lead-in ("Note:") is set as a label; anything longer is ordinary text.
  if (label.text.trim().length > 8) return <Runs runs={block.runs} />;
  return (
    <>
      <span className="t-note-label">{label.text}</span>
      <Runs runs={rest} />
    </>
  );
}

function Block({ block, index }: { block: TractBlock; index: number }) {
  const id = blockAnchor(index);
  const centred = block.align === "center" && "t-center";

  switch (block.type) {
    case "heading":
      return (
        <h2 id={id} className={cn("t-block t-heading", centred)}>
          <span>
            {block.runs.map((run) => run.text).join("")}
          </span>
        </h2>
      );
    case "question":
      return (
        <h3 id={id} className="t-block t-question">
          <Question block={block} />
        </h3>
      );
    case "scripture":
      return (
        <blockquote id={id} className="t-block t-scripture">
          <p>
            <Scripture block={block} />
          </p>
        </blockquote>
      );
    case "note":
      return (
        <p id={id} className="t-block t-paragraph t-note">
          <Note block={block} />
        </p>
      );
    case "label":
      return (
        <p id={id} className="t-block t-label">
          {block.runs.map((run) => run.text).join("")}
        </p>
      );
    default:
      return (
        <p id={id} className={cn("t-block t-paragraph", centred)}>
          <Runs runs={block.runs} />
        </p>
      );
  }
}

export function TractBody({ sections, id }: { sections: TractSection[]; id: string }) {
  return (
    <div id={id} className="tract-prose">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          data-tract-section
          className={cn("scroll-mt-28", section.heading === null && "t-opening")}
        >
          {section.blocks.map(({ block, index }) => (
            <Block key={index} block={block} index={index} />
          ))}
        </section>
      ))}
    </div>
  );
}
