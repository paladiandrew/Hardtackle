import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backImage from "./images/back.png";
import './Registration.css';

export default function Registration() {
    const [name, setName] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    const tgId = tgUser?.id;

    const handleRegister = async () => {
        if (!name.trim()) return;
        
        try {
            const registrationDate = new Date().toISOString();
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    tgId,
                    fullName: name,
                    registrationDate 
                }),
            });

            const result = await response.json();
            if (response.ok) {
                navigate("/main", { state: { registrationSuccess: true } });
            } else {
                console.error(result.message);
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
            
            <h2 className="registration-header">Регистрация</h2>
            <div className="registration-body">
                <Link to="/main" className="back-button">
                    <img src={backImage} alt='' className="vectorImage"/>
                </Link>
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
        </div>
    );
}