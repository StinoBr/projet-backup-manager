import React from 'react';
import { X } from 'lucide-react';

/**
 * Composant Modal générique.
 * @param {boolean} isOpen - Le modal est-il ouvert ?
 * @param {function} onClose - Fonction pour fermer le modal
 * @param {string} title - Titre du modal
 * @param {React.ReactNode} children - Contenu du modal
 */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;