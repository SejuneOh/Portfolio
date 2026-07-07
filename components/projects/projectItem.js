import Badge from "../ badge";

export default function ProjectItem({ data }) {
  const period = data.status
    ? `${data.startDate} ~ ${data.endDate}`
    : `${data.startDate} ~ 진행 중`;

  return (
    <div className="mb-8 break-inside-avoid">
      <article className="group">
        {data.cover && (
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.cover}
              alt={data.projectName}
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}

        <div className="pt-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-fg transition-colors group-hover:text-accent">
            {data.projectName}
            {data.status && <span className="chip">Done</span>}
          </h3>

          {data.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{data.description}</p>
          )}

          <p className="mt-2 font-mono text-xs text-muted">{period}</p>

          {data.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
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
              className="mt-3 inline-block text-sm text-accent transition-colors hover:text-accent-hover"
            >
              GitHub →
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
