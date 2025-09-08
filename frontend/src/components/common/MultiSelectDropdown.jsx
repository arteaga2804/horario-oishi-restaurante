import React, { useState } from 'react';

const MultiSelectDropdown = ({ options, selectedOptions, onChange, placeholder = "Seleccionar..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter(item => item !== optionValue)
      : [...selectedOptions, optionValue];
    onChange(newSelectedOptions);
  };

  const selectedLabels = selectedOptions.map(opt => options[opt]).join(', ');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border rounded-lg bg-white text-left flex justify-between items-center"
      >
        <span className="truncate">{selectedLabels || placeholder}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {options.map((option, index) => (
            <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOptions.includes(index)}
                onChange={() => toggleOption(index)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
