interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 glass-panel border-b border-stone-200 px-8 py-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary-800 tracking-tight drop-shadow-sm">{title}</h1>
          {subtitle && <p className="text-secondary-500 mt-1 font-medium tracking-wide">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-secondary-600 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm backdrop-blur-sm">
              {new Date().toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
