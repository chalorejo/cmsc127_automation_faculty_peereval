import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../../ui/button';

const UserModal = ({
  isOpen,
  isEdit,
  formData,
  setFormData,
  roleOptions,
  collegeOptions,
  imagePreview,
  onImageChange,
  onClose,
  onSubmit,
  isCreating,
  isSaving,
}) => {
  if (!isOpen) return null;

  const isSubmitting = isCreating || isSaving;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-black">{isEdit ? 'Edit User' : 'Add User'}</h2>
            <p className="text-sm text-brand-grey">Create a faculty, admin, dean, or department chair account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-grey hover:bg-gray-100 hover:text-brand-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-200 p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-brand-grey" />
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="image">
                Profile Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full text-sm text-brand-grey file:mr-4 file:rounded-lg file:border-0 file:bg-brand-maroon file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
              />
              <p className="mt-2 text-xs text-brand-grey">Upload a profile picture for this account.</p>
            </div>
          </div>

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
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="college_id">
              College {formData.role === 'Faculty' ? '(required)' : '(optional)'}
            </label>
            <select
              id="college_id"
              value={formData.college_id}
              onChange={(event) => setFormData((prev) => ({ ...prev, college_id: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
            >
              <option value="">Select college</option>
              {collegeOptions.map((college) => (
                <option key={college.college_id} value={college.college_id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-black" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  role: event.target.value,
                  password: event.target.value === 'Faculty' ? '' : prev.password,
                }))
              }
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
              Password (optional)
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-green"
              placeholder={
                isEdit
                  ? 'Leave blank to keep current password'
                  : formData.role === 'Faculty'
                    ? 'Leave blank for faculty'
                    : 'Set a password'
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-brand-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-maroon px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isEdit ? (isSaving ? 'Updating...' : 'Update User') : isCreating ? 'Saving...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
