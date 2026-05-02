import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import facultyIcon from '../../assets/faculty-icon.svg';
import ConfirmationPopup from '../ui/ConfirmationPopup';
import { useToast } from '../../lib/ToastContext';

const FacultyTable = ({ onComplete }) => {
  const facultyData = [
    { id: 1, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 2, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 3, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: true },
    { id: 4, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: false },
    { id: 5, name: 'John Doe', title: 'Assistant Professor', email: 'example@email.com', lastEval: '4/21/2026', checked: false },
  ];

  const [selectedIds, setSelectedIds] = useState(facultyData.filter(f => f.checked).map(f => f.id));
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { showToast } = useToast();

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(facultyData.map(f => f.id));
  const deselectAll = () => setSelectedIds([]);

  const handleStartForms = () => {
    if (selectedIds.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Faculty Selected',
        message: 'Please select at least one faculty member to proceed.',
        actionText: 'Got it'
      });
      return;
    }
    setIsPopupOpen(true);
  };

  const handleConfirm = () => {
    setIsPopupOpen(false);
    // Simulate transaction
    showToast({
      type: 'success',
      title: 'Success',
      message: `Form generation started for ${selectedIds.length} faculty members.`,
      actionText: 'View'
    });
    
    // Proceed to next step after a short delay
    setTimeout(() => {
      onComplete?.();
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Hello Dean!</h1>
        <p className="text-brand-black text-base lg:text-lg">Select all faculty who are qualified for this years' peer evaluation:</p>
      </header>

      <div className="flex flex-col">
        <div className="flex items-center justify-end mb-4 gap-4 lg:gap-6">
          <button onClick={selectAll} className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors">Select All</button>
          <button onClick={deselectAll} className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors">Deselect All</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-5 text-sm font-semibold text-brand-black">Faculty Members</th>
                <th className="hidden lg:table-cell px-6 py-5 text-sm font-semibold text-brand-black">Last Evaluation</th>
                <th className="px-6 py-5 text-sm font-semibold text-brand-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facultyData.map((faculty) => (
                <tr key={faculty.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                         <img src={facultyIcon} alt={faculty.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-black truncate text-sm lg:text-base">{faculty.name}</p>
                        <p className="text-xs text-brand-grey font-medium truncate">{faculty.title}</p>
                        <p className="text-xs text-brand-grey italic truncate">{faculty.email}</p>
                        {/* Mobile Evaluation Date */}
                        <p className="lg:hidden text-[10px] text-brand-grey font-semibold mt-1">
                          Last Evaluation: {faculty.lastEval}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Desktop Evaluation Date */}
                  <td className="hidden lg:table-cell px-6 py-6">
                    <span className="text-sm text-brand-black font-medium">{faculty.lastEval}</span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button 
                      onClick={() => toggleSelect(faculty.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ml-auto ${
                        selectedIds.includes(faculty.id)
                          ? 'bg-brand-green border-brand-green'
                          : 'border-gray-300 bg-white hover:border-gray-400'
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
      </div>

      <div className="mt-8 lg:mt-12 flex justify-end">
        <Button 
          onClick={handleStartForms}
          className="w-full lg:w-auto bg-brand-maroon hover:opacity-90 text-white px-12 py-3 h-auto rounded-[16px] text-lg font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.3)]"
        >
          Start Forms
        </Button>
      </div>

      <ConfirmationPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        onConfirm={handleConfirm}
        title="Proceed to Forms?"
        description="Make sure to double check that all desired faculty is selected."
        confirmLabel="Review"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default FacultyTable;
