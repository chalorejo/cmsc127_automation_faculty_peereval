import React from 'react';
import { Check, Edit3, Loader2, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import facultyIcon from '../../../assets/faculty-icon.svg';

const UsersTable = ({
  members,
  selectedIds,
  isLoading,
  loadError,
  onSelectAll,
  onDeselectAll,
  onAddUser,
  onToggleSelect,
  onEditUser,
  normalizeRoleLabel,
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="text-sm text-brand-grey">
          {isLoading ? 'Loading users...' : `${members.length} user${members.length === 1 ? '' : 's'} loaded`}
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={onSelectAll}
            className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors"
          >
            Select All Faculty
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors"
          >
            Deselect All
          </button>
          <Button
            type="button"
            onClick={onAddUser}
            className="inline-flex items-center gap-2 bg-brand-maroon hover:opacity-90 text-white px-5 py-2.5 h-auto rounded-[14px] text-sm font-medium transition-all shadow-[0_8px_20px_-4px_rgba(123,17,19,0.22)]"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-5 text-sm font-semibold text-brand-black">Member</th>
              <th className="hidden lg:table-cell px-6 py-5 text-sm font-semibold text-brand-black">Role</th>
              <th className="hidden xl:table-cell px-6 py-5 text-sm font-semibold text-brand-black">College</th>
              <th className="hidden lg:table-cell px-6 py-5 text-sm font-semibold text-brand-black">Email</th>
              <th className="px-6 py-5 text-sm font-semibold text-brand-black text-right">Action</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-brand-grey">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            </tbody>
          ) : loadError ? (
            <tbody>
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-brand-maroon">
                  {loadError}
                </td>
              </tr>
            </tbody>
          ) : members.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-brand-grey">
                  No users have been added yet. Use Add User to create the first account.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-50">
              {members.map((member) => {
                const canSelect = member.role === 'Faculty';
                const isSelected = selectedIds.includes(member.id);

                return (
                  <tr key={member.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                          <img
                            src={member.avatarSrc || facultyIcon}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-brand-black truncate text-sm lg:text-base">{member.name}</p>
                          <p className="lg:hidden text-xs text-brand-grey font-medium truncate">{normalizeRoleLabel(member.role)}</p>
                          <p className="text-xs text-brand-grey italic truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-6">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-brand-black">
                        {normalizeRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-6">
                      <span className="text-sm text-brand-black font-medium">
                        {member.collegeName || 'No college assigned'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-6">
                      <span className="text-sm text-brand-black font-medium">{member.email}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canSelect ? (
                          <button
                            onClick={() => onToggleSelect(member.id)}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ml-auto ${
                              isSelected
                                ? 'bg-brand-green border-brand-green'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-brand-grey">
                            View only
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditUser(member)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-brand-black opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-brand-green hover:text-brand-green"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
