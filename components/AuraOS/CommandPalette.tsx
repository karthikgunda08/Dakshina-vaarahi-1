
// src/components/AuraOS/CommandPalette.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { Command } from '../../types/index';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command && !command.disabled) {
          command.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);
  
  useEffect(() => {
    resultsRef.current?.children[selectedIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleExecute = (command: Command) => {
    if (command.disabled) return;
    command.action();
    onClose();
  };

  return (
    <div className="aura-command-palette-overlay" onClick={onClose}>
      <div className="aura-command-palette-modal" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-slate-700">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent text-lg text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <ul ref={resultsRef} className="flex-grow overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li key={command.id}>
                <button
                  onClick={() => handleExecute(command)}
                  disabled={command.disabled}
                  className={`w-full flex justify-between items-center p-3 rounded-md text-left transition-colors ${
                    selectedIndex === index ? 'bg-sky-600' : 'hover:bg-slate-700'
                  } ${command.disabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    {command.icon}
                    <span>{command.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">{command.category}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-slate-400">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};