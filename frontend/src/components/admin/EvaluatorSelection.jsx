import React, { useState } from 'react';
import { Shuffle, Check, User } from 'lucide-react';
import { Button } from '../ui/button';
import facultyIcon from '../../assets/faculty-icon.svg';

const EvaluatorSelection = ({ onConfirm }) => {
  const [facultyPicks, setFacultyPicks] = useState([
    {
      id: 1,
      name: 'John Doe',
      title: 'Assistant Professor',
      picks: [
        { id: 101, name: 'Alice Smith' },
        { id: 102, name: 'Bob Wilson' },
        { id: 103, name: 'Charlie Brown' },
        { id: 104, name: 'David Lee' },
        { id: 105, name: 'Eve Adams' },
      ],
      selected: [],
    },
    {
      id: 2,
      name: 'Jane Smith',
      title: 'Associate Professor',
      picks: [
        { id: 201, name: 'Frank Wright' },
        { id: 202, name: 'Grace Hopper' },
        { id: 203, name: 'Heidi Klum' },
        { id: 204, name: 'Ivan Grozny' },
        { id: 205, name: 'Judy Garland' },
      ],
      selected: [],
    },
  ]);

  const toggleSelection = (facultyId, pickId) => {
    setFacultyPicks(prev => prev.map(f => {
      if (f.id !== facultyId) return f;
      
      const isSelected = f.selected.includes(pickId);
      if (isSelected) {
        return { ...f, selected: f.selected.filter(id => id !== pickId) };
      } else {
        if (f.selected.length >= 3) return f; // Max 3
        return { ...f, selected: [...f.selected, pickId] };
      }
    }));
  };

  const randomizeAll = () => {
    setFacultyPicks(prev => prev.map(f => {
      const shuffled = [...f.picks].sort(() => 0.5 - Math.random());
      return { ...f, selected: shuffled.slice(0, 3).map(p => p.id) };
    }));
  };

  const isAllValid = facultyPicks.every(f => f.selected.length === 3);

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Assign Evaluators</h1>
          <p className="text-brand-grey text-base lg:text-lg">Pick 3 evaluators for each faculty member from their top 5 choices.</p>
        </div>
        <button 
          onClick={randomizeAll}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-brand-black font-medium hover:bg-gray-50 transition-all shadow-sm"
        >
          <Shuffle className="w-4 h-4" />
          Randomize All
        </button>
      </header>

      <div className="space-y-6">
        {facultyPicks.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Faculty Info */}
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                  <img src={facultyIcon} alt={faculty.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-black text-lg">{faculty.name}</h3>
                  <p className="text-sm text-brand-grey font-medium">{faculty.title}</p>
                </div>
              </div>

              {/* Picks Grid */}
              <div className="flex-1">
                <p className="text-xs font-bold text-brand-grey uppercase tracking-wider mb-4">Select 3 Evaluators:</p>
                <div className="flex flex-wrap gap-3">
                  {faculty.picks.map((pick) => {
                    const isSelected = faculty.selected.includes(pick.id);
                    return (
                      <button
                        key={pick.id}
                        onClick={() => toggleSelection(faculty.id, pick.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-green border-brand-green text-white shadow-md'
                            : 'bg-white border-gray-200 text-brand-grey hover:border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {pick.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={faculty.selected.length === 3 ? 'text-brand-green' : 'text-brand-maroon'}>
                  {faculty.selected.length}/3 Selected
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-end">
        <Button 
          disabled={!isAllValid}
          onClick={onConfirm}
          className={`w-full lg:w-auto px-12 py-3 h-auto rounded-[16px] text-lg font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.3)] ${
            isAllValid ? 'bg-brand-maroon text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Selection
        </Button>
      </div>
    </div>
  );
};

export default EvaluatorSelection;
