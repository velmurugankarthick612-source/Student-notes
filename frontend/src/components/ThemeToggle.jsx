import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Palette, Check } from 'lucide-react';

const ThemeToggle = ({ compact = false }) => {
  const { themeMode, setThemeMode, accent, setAccent, isDark, toggleDarkMode, accentColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const modes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="flex items-center gap-1.5" ref={dropdownRef}>
      {/* 1-Click Instant Dark / Light Toggle Button */}
      <button
        type="button"
        onClick={toggleDarkMode}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark/light mode"
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        )}
      </button>

      {/* Palette Popover Trigger for Accent Themes & System Mode */}
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Color Accents & Theme Settings"
          aria-label="Customize theme accent"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 shrink-0"
            style={{
              backgroundColor: accentColors.find((c) => c.id === accent)?.color || '#6366f1',
            }}
          />
        </button>

        {/* Popover Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                Appearance & Theme
              </span>
            </div>

            {/* Theme Mode Selection */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
                Display Mode
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const active = themeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setThemeMode(mode.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent Selection */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
                Accent Color
              </div>
              <div className="grid grid-cols-3 gap-2">
                {accentColors.map((c) => {
                  const isSelected = accent === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setAccent(c.id)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;
