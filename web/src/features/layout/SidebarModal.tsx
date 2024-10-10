import React, { useEffect, useRef } from "react";
import { XCircle } from "react-feather";
import SidebarItems from "./SidebarItems"; // Import SidebarItems component

const SidebarModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
            <div
                ref={modalRef}
                className="fixed left-0 top-0 w-64 h-full bg-k-Cream-700 dark:bg-k-Blue-default shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out"
                style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
            >
        <div className="fixed inset-0 z-50 bg-opacity-50">
            <div className="flex justify-between items-center p-4 border-b border-black dark:border-gray-600">
                <h2 className="text-kadena text-lg">Main Menu</h2>
                <button onClick={onClose}>
                    <XCircle className="h-6 w-6" />
                </button>
            </div>
                {/* Sidebar Content Here */}
                <div className="mt-4">
                    <SidebarItems onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export default SidebarModal;
