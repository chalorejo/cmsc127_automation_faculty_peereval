import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

const ConfirmationPopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  description = "Please confirm your action.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "maroon" // can be "maroon", "green", etc.
}) => {
  if (!isOpen) return null;

  const confirmButtonStyles = {
    maroon: "bg-brand-maroon shadow-[0_8px_20px_-4px_rgba(123,17,19,0.2)]",
    green: "bg-brand-green shadow-[0_8px_20px_-4px_rgba(0,86,63,0.2)]",
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] p-8 lg:p-12 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-grey hover:text-brand-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl lg:text-4xl font-normal text-brand-green mb-4 font-heading">
          {title}
        </h2>
        
        <p className="text-brand-grey text-sm lg:text-base mb-10 max-w-[300px]">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-8 rounded-[16px] border border-gray-200 text-brand-grey font-medium hover:bg-gray-50 transition-all text-base shadow-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-8 rounded-[16px] text-white font-medium hover:opacity-90 transition-all text-base ${confirmButtonStyles[variant] || confirmButtonStyles.maroon}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
