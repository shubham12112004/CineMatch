import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...",
  buttonLabel,
  colorTheme = "red",
  icon: Icon = null,
  buttonWidth = 'w-auto',
  buttonClassName = '',
  menuClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.shortLabel || buttonLabel || selectedOption?.label || placeholder;
  
  const colorMap = {
    red: {
      border: 'border-red-600/40 hover:border-red-600/70',
      bg: 'bg-linear-to-r from-red-900/30 to-[#1a1a1a]',
      text: 'text-red-300',
      hover: 'hover:bg-red-900/40 hover:border-red-500',
      shadow: 'hover:shadow-red-600/30 focus:shadow-red-600/40',
      icon: 'text-red-600',
      active: 'bg-red-900/60 text-red-300 border-red-600/50'
    },
    blue: {
      border: 'border-blue-600/40 hover:border-blue-600/70',
      bg: 'bg-linear-to-r from-blue-900/30 to-[#1a1a1a]',
      text: 'text-blue-300',
      hover: 'hover:bg-blue-900/40 hover:border-blue-500',
      shadow: 'hover:shadow-blue-600/30 focus:shadow-blue-600/40',
      icon: 'text-blue-600',
      active: 'bg-blue-900/60 text-blue-300 border-blue-600/50'
    },
    emerald: {
      border: 'border-emerald-600/40 hover:border-emerald-600/70',
      bg: 'bg-linear-to-r from-emerald-900/30 to-[#1a1a1a]',
      text: 'text-emerald-300',
      hover: 'hover:bg-emerald-900/40 hover:border-emerald-500',
      shadow: 'hover:shadow-emerald-600/30 focus:shadow-emerald-600/40',
      icon: 'text-emerald-600',
      active: 'bg-emerald-900/60 text-emerald-300 border-emerald-600/50'
    },
    violet: {
      border: 'border-violet-600/40 hover:border-violet-600/70',
      bg: 'bg-linear-to-r from-violet-900/30 to-[#1a1a1a]',
      text: 'text-violet-300',
      hover: 'hover:bg-violet-900/40 hover:border-violet-500',
      shadow: 'hover:shadow-violet-600/30 focus:shadow-violet-600/40',
      icon: 'text-violet-600',
      active: 'bg-violet-900/60 text-violet-300 border-violet-600/50'
    }
  };

  const colors = colorMap[colorTheme] || colorMap.red;

  return (
    <div ref={dropdownRef} className="relative min-w-0">
      {/* Button - Fixed width to not break navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${buttonWidth} max-w-full h-10 px-2.5 rounded-xl border flex items-center justify-between gap-1.5 font-bold text-xs uppercase tracking-wide transition-all duration-300 whitespace-nowrap ${colors.bg} ${colors.border} ${colors.shadow} hover:shadow-lg ${buttonClassName}`}
        title={selectedOption?.label || placeholder}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon size={16} className={colors.icon} />}
          <span className={`${colors.text} truncate`}>
            {displayLabel}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className={colors.icon} />
        </motion.div>
      </button>

      {/* Dropdown Menu - Floats above content without pushing elements */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 mt-2 bg-[#0a0a0a] border ${colors.border} rounded-lg shadow-2xl z-120 overflow-hidden w-56 max-w-[min(88vw,22rem)] origin-top ${menuClassName}`}
          >
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {options.map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3.5 text-left font-bold text-sm uppercase tracking-wide transition-all duration-200 border-b border-white/5 last:border-b-0 flex items-center gap-3
                    ${value === option.value 
                      ? `${colors.active || `${colors.bg} ${colors.text}`}` 
                      : `text-gray-300 ${colors.hover} ${colors.text} hover:bg-white/5`
                    }
                  `}
                >
                  {/* Checkmark for selected */}
                  {value === option.value && (
                    <div className={`w-2 h-2 rounded-full ${colors.icon}`} />
                  )}
                  <span className={value === option.value ? 'ml-2' : ''}>{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
