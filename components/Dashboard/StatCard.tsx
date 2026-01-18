interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function StatCard({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="stat-card group cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-serif font-bold text-secondary-800 mt-2 tracking-tight group-hover:text-primary-600 transition-colors">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${changeColors[changeType]}`}>
              <span>{changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '•'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="text-3xl p-3 rounded-xl bg-secondary-50 text-secondary-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
