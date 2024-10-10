import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface HoverButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  expandedText?: string;
  collapsedText?: string;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  isExpanded,
  onClick,
  expandedText = "Hide Locks",
  collapsedText = "Show Locks",
}) => {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center group"
    >
      {/* Icon Container */}
      <div
        className="bg-k-Green-default text-white flex items-center justify-center
        shadow-lg transition-all duration-300 ease-in-out
        w-8 h-8 rounded-full group-hover:w-24 group-hover:h-8"
      >
        {isExpanded ? (
          <Minus className="h-6 w-6 transition-transform duration-300 ease-in-out transform group-hover:scale-0" />
        ) : (
          <Plus className="h-6 w-6 transition-transform duration-300 ease-in-out transform group-hover:scale-0" />
        )}
      </div>
      {/* Text Container */}
      <div
        className="absolute bg-k-Green-default text-white flex items-center justify-center
        shadow-lg transition-all duration-300 ease-in-out
        w-24 h-8 rounded-full opacity-0 group-hover:opacity-100"
      >
        <span className="text-center transition-opacity duration-300 ease-in-out">
          {isExpanded ? expandedText : collapsedText}
        </span>
      </div>
    </button>
  );
};

export default HoverButton;
