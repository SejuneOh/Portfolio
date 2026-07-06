import Image from "next/image";
import Badge from "../ badge";

export default function ProjectItem({ data }) {
  const period = data.status
    ? `${data.startDate} ~ ${data.endDate}`
    : `${data.startDate} ~ 진행 중`;

  return (
    <div className="card group overflow-hidden hover:bg-surface-hover hover:shadow-sm">
      {data.cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line bg-surface">
          <Image
            src={data.cover}
            alt={data.projectName}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-fg">{data.projectName}</h3>
          {data.status && <span className="chip">Done</span>}
        </div>

        {data.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{data.description}</p>
        )}

        <p className="mt-3 font-mono text-xs text-muted">{period}</p>

        {data.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <Badge key={tag.id} text={tag.name} />
            ))}
          </div>
        )}

        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-accent transition-colors hover:text-accent-hover"
          >
            GitHub →
          </a>
        )}
      </div>
    </div>
  );
}
