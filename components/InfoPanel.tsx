interface InfoPanelProps {
  title: string;
  items?: string[];
  emptyText?: string;
}

const InfoPanel = ({ title, items, emptyText }: InfoPanelProps) => {
  const visible = (items || []).filter(Boolean);

  if (visible.length === 0 && !emptyText) return null;

  return (
    <section className="rounded-2xl border border-light-400 bg-white p-6">
      <h3 className="p-18-semibold text-dark-100">{title}</h3>
      {visible.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {visible.map((item, index) => (
            <li key={index} className="text-sm leading-relaxed text-dark-400">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-500">{emptyText}</p>
      )}
    </section>
  );
};

export default InfoPanel;
