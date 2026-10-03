type TFeaturePageProps = {
  title: string;
  description: string;
};

export function FeaturePage({ title, description }: TFeaturePageProps) {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-6 rounded-xl border border-white bg-white p-6 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-8">
        <p className="text-sm text-muted">
          This page is ready for the {title.toLowerCase()} API from the backend.
        </p>
      </div>
    </section>
  );
}
