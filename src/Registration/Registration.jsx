import React, { useState, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import backImage from "./images/back.png";
import './Registration.css';

export default function Registration() {
    const [name, setName] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { state } = useLocation();
    const queryParams = new URLSearchParams(window.location.search);
    const tgId = state?.tgId || queryParams.get('tgId');
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Возврат на предыдущую страницу
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

            if (response.ok) {
                navigate("/main", { state: { registrationSuccess: true } });
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
        }
    };


    return (
        <div className="registration">
            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <p>Вы точно хотите зарегистрировать участника?</p>
                        <div className="confirmation-buttons">
                            <button 
                                className="cancel-button" 
                                onClick={() => setShowConfirmation(false)}
                            >
                                Отмена
                            </button>
                            <button 
                                className="confirm-button" 
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
            
            <div className="registration-header">
                <button className="registration-back" onClick={handleBack} >
                    <img src={backImage} alt="Назад" className="registration-image"/>
                </button>
                <h2 className="registration-title">Регистрация</h2>
            </div>
            
                <input 
                    type="text" 
                    placeholder="Введите ФИО участника"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="registration-input"
                />
                <button 
                    className="registration-button" 
                    onClick={() => setShowConfirmation(true)}
                    disabled={!name.trim()}
                >
                    Зарегистрировать участника
                </button>
        </div>
    );
}