import React from 'react';
import { CheckCircle2, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="bg-sky-600 text-white p-1.5 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900">CivicFix</span>
          <span className="text-slate-400 text-sm">| Empowering Local Communities</span>
        </div>

        <p className="text-sm text-slate-500 flex items-center gap-1">
          Built for citizens and local authorities with <Heart className="w-4 h-4 text-rose-500 fill-current inline" /> &copy; {new Date().getFullYear()} CivicFix Platform.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
