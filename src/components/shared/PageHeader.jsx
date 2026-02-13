import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PageHeader = ({ icon, iconColor, title, subtitle, description }) => {
  const colorClasses = {
    red: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      hover: 'hover:text-red-400'
    },
    blue: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      hover: 'hover:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      hover: 'hover:text-purple-400'
    },
    orange: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
      hover: 'hover:text-orange-400'
    }
  };

  const colors = colorClasses[iconColor] || colorClasses.red;

  return (
    <div className="mb-8">
      <Link to="/" className={`inline-flex items-center gap-2 text-white/40 ${colors.hover} transition-colors font-mono text-sm mb-6`}>
        <ChevronLeft size={16} />
        ../BACK_TO_HOME
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${colors.bg} border ${colors.border} rounded flex items-center justify-center`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tight">{title}</h1>
          <div className="text-sm text-white/50 font-mono">{subtitle}</div>
        </div>
      </div>
      <div className="text-white/60 max-w-2xl">
        {description}
      </div>
    </div>
  );
};

export default PageHeader;
