import React, { useCallback, useRef } from 'react';
import styles from '../../styles/modals.module.css';

export interface ModalOverlayProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Shared modal wrapper. Clicking the overlay backdrop closes the modal.
 * Matches the `.overlay` / `.modal` styling from the original HTML (lines 118-131).
 */
const ModalOverlay: React.FC<ModalOverlayProps> = ({ show, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close when clicking the overlay backdrop itself, not the modal content
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div
      className={`${styles.overlay} ${show ? styles.show : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal} ref={modalRef}>
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;
