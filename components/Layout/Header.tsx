interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 glass-panel border-b border-white/20 px-8 py-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 tracking-tight">{title}</h1>
          {subtitle && <p className="text-stone-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-stone-500 bg-white/50 px-4 py-2 rounded-full border border-stone-100 shadow-sm">
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
