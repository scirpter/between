import { Fragment, type CSSProperties, type ReactNode } from "react";
import { chapters, type ChapterId } from "@/lib/chapters";

export function ChapterSection({ id, children }: { id: ChapterId; children: ReactNode }) {
  const chapter = chapters.find((item) => item.id === id)!;
  return <section className={`chapter ${id}`} id={id} aria-labelledby={`${id}-title`} data-chapter={id} style={{ "--chapter-height": `${chapter.desktopHeight}svh`, "--mobile-height": `${chapter.mobileHeight}svh` } as CSSProperties}>{children}</section>;
}

export function ChapterHeading({ id }: { id: ChapterId }) {
  const chapter = chapters.find((item) => item.id === id)!;
  const Tag = id === "within" ? "h1" : "h2";
  const soft = id === "thought" || id === "afterglow";
  return <Tag id={`${id}-title`} tabIndex={-1}>
    {chapter.title.map((line, index) => {
      const last = index === chapter.title.length - 1;
      return <span key={line} className={last && soft ? "soft-type" : last && id === "connection" ? "open-word" : undefined}>{last && !soft && line.endsWith(".") ? <>{line.slice(0, -1)}<span className="amber-period">.</span></> : line}{!last && " "}</span>;
    })}
  </Tag>;
}

export function ChapterBody({ id }: { id: ChapterId }) {
  const chapter = chapters.find((item) => item.id === id)!;
  return <p>{chapter.body.map((line, index) => <Fragment key={line}>{index > 0 && <><br />{" "}</>}{line}</Fragment>)}</p>;
}
