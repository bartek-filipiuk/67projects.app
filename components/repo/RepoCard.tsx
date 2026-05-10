import { repeat } from "@/lib/ascii";

export interface RepoCardData {
  name: string;
  fullPath: string;
  description: string;
  lang: string;
  starsCached: number;
  license: string;
}

export function RepoCard({ p }: { p: RepoCardData }) {
  return (
    <a
      href={`https://${p.fullPath}`}
      target="_blank"
      rel="noopener noreferrer"
      className="file-card"
    >
      <div className="file-card-path">{p.fullPath}</div>
      <div className="file-card-divider">{repeat("-", 80)}</div>
      <div className="file-card-body">
        <div className="file-card-title">{p.name}</div>
        <div className="file-card-desc">{p.description}</div>
        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}># lang: {p.lang}</div>
      </div>
      <div className="file-card-footer">
        <div className="file-card-stars">★ {p.starsCached} stars</div>
        <div className={`file-tag tag-${p.license === "EXPERIMENTAL" ? "hot" : "license"}`}>
          [{p.license}]
        </div>
      </div>
    </a>
  );
}
