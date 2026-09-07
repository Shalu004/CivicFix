import React from 'react';
import { Construction, Trash2, Waves, Zap, Droplet, Lamp, AlertCircle } from 'lucide-react';

const CategoryIcon = ({ category, className = "w-5 h-5" }) => {
  switch (category?.toUpperCase()) {
    case 'POTHOLE':
      return <Construction className={`${className} text-amber-600`} />;
    case 'GARBAGE':
      return <Trash2 className={`${className} text-emerald-600`} />;
    case 'SEWAGE':
      return <Waves className={`${className} text-teal-600`} />;
    case 'ELECTRICITY':
      return <Zap className={`${className} text-yellow-500`} />;
    case 'WATER':
      return <Droplet className={`${className} text-sky-600`} />;
    case 'STREETLIGHT':
      return <Lamp className={`${className} text-indigo-600`} />;
    case 'OTHER':
    default:
      return <AlertCircle className={`${className} text-slate-500`} />;
  }
};

export default CategoryIcon;
