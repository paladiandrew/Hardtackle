import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorModal from '../components/ErrorModal';
import backImage from "./images/back.png";
import './Registration.css';

export default function Registration() {
    const [error, setError] = useState(null);
    const [name, setName] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const { tgId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(`/main/${tgId}`);
    };

    const handleRegister = async () => {
        if (!name.trim()) return;
        
        try {
            const response = await fetch('https://htcupbackend.ru/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    tgId,
                    fullName: name,
                    registrationDate: new Date().toISOString()
                }),
            });

            if (response.status === 400) {
                const data = await response.json();
                if (data.message === "Максимум 10 регистраций на пользователя") {
                    setShowLimitModal(true);
                    return;
                }
            }

            if (response.ok) {
                setShowSuccessModal(true); // Показываем окно успешной регистрации
            }
        } catch (error) {
            setError(error.message || "Ошибка регистрации");
        }
    };

    return (
        <div className="registration-page">
            {error && <ErrorModal message={error} />}
            
            {/* Модальное окно лимита регистраций */}
            {showLimitModal && (
                <div className="registration-page-limit-overlay">
                    <div className="registration-page-limit-modal">
                        <p>Вы достигли максимального количества регистраций (2 на пользователя)</p>
                        <button 
                            className="registration-page-ok-button" 
                            onClick={() => setShowLimitModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            
            {/* Модальное окно подтверждения регистрации */}
            {showConfirmation && (
                <div className="registration-page-confirmation-overlay">
                    <div className="registration-page-confirmation-modal">
                        <p>Вы точно хотите зарегистрировать участника?</p>
                        <div className="registration-page-confirmation-buttons">
                            <button 
                                className="registration-page-cancel-button" 
                                onClick={() => setShowConfirmation(false)}
                            >
                                Отмена
                            </button>
                            <button 
                                className="registration-page-confirm-button" 
                                onClick={() => {
                                    setShowConfirmation(false);
                                    handleRegister();
                                }}
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Новое модальное окно успешной регистрации */}
            {showSuccessModal && (
                <div className="registration-page-success-overlay">
                    <div className="registration-page-success-modal">
                        <p>Участник успешно зарегистрирован!</p>
                        <button 
                            className="registration-page-ok-button" 
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate(`/main/${tgId}`);
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            
            <div className="registration-page-header">
                <button className="registration-page-back-button" onClick={handleBack}>
                    <img src={backImage} alt="Назад" className="registration-page-back-icon"/>
                </button>
                <h2 className="registration-page-title">Регистрация</h2>
            </div>
            
            <div className="registration-page-content">
                <input 
                    type="text" 
                    placeholder="Введите ФИО участника"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="registration-page-input"
                />
                <button 
                    className="registration-page-submit-button" 
                    onClick={() => setShowConfirmation(true)}
                    disabled={!name.trim()}
                >
                    Зарегистрировать участника
                </button>
            </div>
        </div>
    );
}