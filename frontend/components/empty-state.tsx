import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div>
        <p className="eyebrow">Sem resultados</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link className="secondary-button" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
