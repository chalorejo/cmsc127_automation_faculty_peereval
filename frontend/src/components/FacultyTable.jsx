import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';

const FacultyTable = () => {
  const facultyData = [
    { id: 1, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 2, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 3, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 4, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: false },
    { id: 5, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: false },
  ];

  const [selectedIds, setSelectedIds] = useState(facultyData.filter(f => f.checked).map(f => f.id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(facultyData.map(f => f.id));
  const deselectAll = () => setSelectedIds([]);

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#F9FAFB]">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Hello Dean!</h1>
        <p className="text-gray-500 text-lg">Select all faculty who are qualified for this years' peer evaluation:</p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-end px-6 py-4 border-b border-gray-50 gap-6">
          <button onClick={selectAll} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Select All</button>
          <button onClick={deselectAll} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Deselect All</button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-5 text-sm font-semibold text-gray-900">Faculty Members</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-900">Last Evaluation</th>
              <th className="px-8 py-5 text-sm font-semibold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {facultyData.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                       <div className="w-full h-full bg-gray-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{faculty.name}</p>
                      <p className="text-xs text-gray-500 font-medium italic">{faculty.title}</p>
                      <p className="text-xs text-gray-400 font-medium">{faculty.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-sm text-gray-500 font-medium">{faculty.lastEval}</span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button 
                    onClick={() => toggleSelect(faculty.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedIds.includes(faculty.id)
                        ? 'bg-emerald-900 border-emerald-900 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {selectedIds.includes(faculty.id) && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          className="bg-maroon hover:bg-[#600D0F] text-white px-10 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-maroon/20 active:scale-95 transition-all"
        >
          Start Forms
        </Button>
      </div>
    </div>
  );
};

export default FacultyTable;
