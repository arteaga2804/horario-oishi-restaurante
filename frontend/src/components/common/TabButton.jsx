import React from 'react';

const TabButton = ({ id, label, icon: Icon, active, onClick, className }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all mb-2 ${ 
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    } ${className || ''}`}
  >
    {Icon && <Icon size={20} />}
    {label}
  </button>
);

export default TabButton;
