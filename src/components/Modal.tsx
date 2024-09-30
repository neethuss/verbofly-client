import React from 'react';
import ReactDOM from 'react-dom';
import { IoCloseCircle } from 'react-icons/io5';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children }) => {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
          <button className="text-white hover:text-yellow-400" onClick={onClose}>
            <IoCloseCircle size={24} />
          </button>
        </header>
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
