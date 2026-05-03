import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import facultyIcon from '../../assets/faculty-icon.svg';
import ConfirmationPopup from '../ui/ConfirmationPopup';
import { useToast } from '../../lib/ToastContext';
import { api } from '../../lib/api';

const FacultyTable = ({ onComplete }) => {
  const roleOptions = useMemo(() => ([
    { value: 'Faculty', label: 'Faculty' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Dean', label: 'Dean' },
    { value: 'DepChair', label: 'Department Chair' },
  ]), []);

  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Faculty',
    password: '',
  });
  const { showToast } = useToast();

  const normalizeRoleLabel = (role) => {
    const option = roleOptions.find((item) => item.value === role);
    return option ? option.label : role || 'Faculty';
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await api.users.listAll();
      const nextMembers = Array.isArray(data)
        ? data.map((user) => ({
            id: user.user_id,
            name: user.full_name,
            role: user.role,
            email: user.email,
          }))
        : [];

      setMembers(nextMembers);
      setSelectedIds((prev) => prev.filter((id) => nextMembers.some((member) => member.id === id && member.role === 'Faculty')));
    } catch (error) {
      setLoadError(error.message || 'Failed to load users');
      showToast({
        type: 'error',
        title: 'Unable to load users',
        message: error.message || 'Please refresh and try again.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleSelect = (id) => {
    const member = members.find((item) => item.id === id);
    if (!member || member.role !== 'Faculty') {
      return;
    }

    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(members.filter((member) => member.role === 'Faculty').map((member) => member.id));
  const deselectAll = () => setSelectedIds([]);

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing information',
        message: 'Full name and email are required.',
        actionText: 'Okay',
      });
      return;
    }

    if (formData.role !== 'Faculty' && !formData.password.trim()) {
      showToast({
        type: 'warning',
        title: 'Password required',
        message: 'Admin, Dean, and Department Chair accounts need a password.',
        actionText: 'Okay',
      });
      return;
    }

    setIsCreating(true);
    try {
      await api.users.create({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        ...(formData.password.trim() ? { password: formData.password } : {}),
      });

      showToast({
        type: 'success',
        title: 'User created',
        message: `${formData.full_name.trim()} was added successfully.`,
        actionText: 'Done',
      });

      setFormData({
        full_name: '',
        email: '',
        role: 'Faculty',
        password: '',
      });
      setIsAddModalOpen(false);
      await loadUsers();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create failed',
        message: error.message || 'Could not create user.',
        actionText: 'Dismiss',
      });
    } finally {
      setIsCreating(false);
    }
  };

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
        <p className="text-brand-black text-base lg:text-lg">Manage faculty, admin, dean, and department chair accounts from this page.</p>
      </header>

      <div className="flex flex-col">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="text-sm text-brand-grey">
            {isLoading ? 'Loading users...' : `${members.length} user${members.length === 1 ? '' : 's'} loaded`}
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={selectAll} className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors">Select All Faculty</button>
            <button onClick={deselectAll} className="text-xs lg:text-sm font-medium text-brand-grey hover:text-brand-black transition-colors">Deselect All</button>
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
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
                <th className="hidden lg:table-cell px-6 py-5 text-sm font-semibold text-brand-black">Email</th>
                <th className="px-6 py-5 text-sm font-semibold text-brand-black text-right">Action</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-brand-grey">
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
                  <td colSpan="4" className="px-6 py-12 text-center text-brand-maroon">
                    {loadError}
                  </td>
                </tr>
              </tbody>
            ) : members.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-brand-grey">
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
                             <img src={facultyIcon} alt={member.name} className="w-full h-full object-cover" />
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
                      <td className="hidden lg:table-cell px-6 py-6">
                        <span className="text-sm text-brand-black font-medium">{member.email}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        {canSelect ? (
                          <button 
                            onClick={() => toggleSelect(member.id)}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-black">Add User</h2>
                <p className="text-sm text-brand-grey">Create a faculty, admin, dean, or department chair account.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-2 text-brand-grey hover:bg-gray-100 hover:text-brand-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="full_name">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                  placeholder="juan@school.edu"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value, password: event.target.value === 'Faculty' ? '' : prev.password }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="password">
                  Password {formData.role !== 'Faculty' ? '(required)' : '(optional)'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
                  placeholder={formData.role === 'Faculty' ? 'Leave blank for faculty' : 'Set a password'}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-brand-black hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-brand-maroon px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? 'Saving...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTable;
