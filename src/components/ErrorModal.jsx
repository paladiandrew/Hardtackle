import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ErrorModal.css';

export default function ErrorModal({ message }) {
    const { tgId } = useParams();
    const navigate = useNavigate();

    const handleOkClick = () => {
        navigate(`/main/${tgId}`);
    };

    return (
        <div className="error-modal-page">
            <div className="error-modal-overlay">
                <div className="error-modal-container">
                    <p className="error-modal-message">{message || "Произошла ошибка"}</p>
                    <button 
                        className="error-modal-ok-button"
                        onClick={handleOkClick}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}