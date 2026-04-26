import React from 'react';
import { FaTimes, FaEnvelope, FaPhoneAlt, FaExclamationCircle } from 'react-icons/fa';
import './modalpass.css';

const ModalPassword = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

 

  return (
    <div className=" dark:!bg-[#1a202c] modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="modal-header">
          <FaExclamationCircle className="modal-icon" />
          <h2>Forgot Password</h2>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">
            To reset your password, please contact the administration:
          </p>
          
          <div className="contact-methods">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>admin@jobconnect.com</span>
            </div>
            <div className="contact-item">
              <FaPhoneAlt className="contact-icon" />
              <span>+XX X XX XX XX XX</span>
            </div>
          </div>
        </div>
        
        <button className="modal-action-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default ModalPassword;
