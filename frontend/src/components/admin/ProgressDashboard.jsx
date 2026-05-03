import React from 'react';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import facultyIcon from '../../assets/faculty-icon.svg';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div 
        className="bg-brand-green h-full transition-all duration-1000 ease-out rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const ProgressDashboard = () => {
  const progressData = [
    { id: 1, name: 'John Doe', title: 'Assistant Professor', completed: 3, total: 3 },
    { id: 2, name: 'Jane Smith', title: 'Associate Professor', completed: 1, total: 3 },
    { id: 3, name: 'Alice Wilson', title: 'Professor', completed: 0, total: 3 },
    { id: 4, name: 'Robert Brown', title: 'Assistant Professor', completed: 2, total: 3 },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 bg-brand-bg min-h-screen">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-4xl lg:text-6xl font-normal text-brand-green mb-2 font-heading">Evaluation Progress</h1>
        <p className="text-brand-grey text-base lg:text-lg">Monitor the real-time status of faculty peer evaluations.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">1</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Fully Completed</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">2</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">In Progress</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">4</p>
            <p className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Total Faculty</p>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-8 py-5 text-sm font-semibold text-brand-black">Faculty Member</th>
              <th className="px-8 py-5 text-sm font-semibold text-brand-black">Completion Status</th>
              <th className="px-8 py-5 text-sm font-semibold text-brand-black text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {progressData.map((faculty) => {
              const percentage = (faculty.completed / faculty.total) * 100;
              return (
                <tr key={faculty.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                         <img src={facultyIcon} alt={faculty.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-black truncate text-sm lg:text-base">{faculty.name}</p>
                        <p className="text-xs text-brand-grey font-medium truncate">{faculty.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold text-brand-grey uppercase tracking-wider">
                        <span>{faculty.completed} of {faculty.total} Evaluations</span>
                        <span className={percentage === 100 ? 'text-brand-green' : 'text-brand-black'}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <ProgressBar progress={percentage} />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      percentage === 100 
                        ? 'bg-green-50 text-brand-green' 
                        : percentage > 0 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-gray-50 text-brand-grey'
                    }`}>
                      {percentage === 100 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDashboard;
