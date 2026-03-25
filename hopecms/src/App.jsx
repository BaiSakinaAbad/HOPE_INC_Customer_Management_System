import { TextQuote } from 'lucide-react';
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl text-center border-t-8 border-blue-600">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          WELCOME TO <span className="text-blue-600">HOPE, INC.</span>
        </h1>
        <h2 className="text-xl font-semibold text-slate-600 uppercase tracking-widest mb-6">
          Customer Management System
        </h2>
        
        <div className="space-y-4 text-left bg-slate-50 p-6 rounded-lg border border-slate-200">
          <p className="flex items-center text-slate-700">
            <span className="bg-green-500 w-3 h-3 rounded-full mr-3 animate-pulse"></span>
            Tailwind v4: <strong className="ml-2 text-green-700">ACTIVE</strong>
          </p>
          <p className="flex items-center text-slate-700">
            <span className="bg-green-500 w-3 h-3 rounded-full mr-3 animate-pulse"></span>
            React 18 + Vite: <strong className="ml-2 text-green-700">RUNNING</strong>
          </p>
          <p className="text-sm text-slate-500 italic mt-4">
            Kita mo yung pulsing green dots? Goods your environment is ready.
          </p>
        </div>

        <p className="mt-8 text-slate-400 text-xs">
          Prepared by sakiki | hopecms v0.0.1
        </p>
          <blockquote>"If your model reached its quota limit, tulog na, wala ka naman bebe"</blockquote>
      </div>
    </div>
  );
}

export default App;