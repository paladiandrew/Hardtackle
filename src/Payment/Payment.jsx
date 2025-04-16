import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Payment.css";

export default function Payment() {
    const { tgId } = useParams();
    const [markedParticipants, setMarkedParticipants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMarkedParticipants = async () => {
            try {
                const response = await fetch(`https://htcupbackend.ru/api/payment/participants?tgId=${tgId}`);
                const data = await response.json();
                setMarkedParticipants(data);
            } catch (error) {
                console.error("Ошибка загрузки участников:", error);
            }
        };
        fetchMarkedParticipants();
    }, [tgId]);

    const handlePayment = async () => {
        try {
            // Здесь должна быть интеграция с платежной системой
            // После успешной оплаты:
            await fetch(`https://htcupbackend.ru/api/payment/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tgId })
            });
            
            navigate(`/main/${tgId}`);
        } catch (error) {
            console.error("Ошибка оплаты:", error);
        }
    };

    return (
        <div className="payment-page">
            <h2>Оплата участия</h2>
            
            <div className="payment-summary">
                <h3>Выбранные участники:</h3>
                <ul>
                    {markedParticipants.map(participant => (
                        <li key={participant.id}>
                            {participant.fullName} ({participant.code})
                        </li>
                    ))}
                </ul>
                
                <div className="total-amount">
                    Итого к оплате: {markedParticipants.length * 1000} ₽
                </div>
            </div>
            
            <button 
                className="pay-button"
                onClick={handlePayment}
            >
                Оплатить
            </button>
        </div>
    );
}