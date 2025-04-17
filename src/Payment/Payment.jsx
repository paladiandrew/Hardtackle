import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backImage from "./images/back.png";
import { v4 as uuidv4 } from 'uuid';
import "./Payment.css";

export default function Payment() {
    const { tgId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`https://htcupbackend.ru/api/payment/participants?tgId=${tgId}`);
                const data = await response.json();
                setParticipants(data);
                if (data.length > 0) {
                    setSelectedParticipant(data[0].id); // Автовыбор первого участника
                }
            } catch (error) {
                console.error("Error fetching participants:", error);
            }
        };
        
        fetchParticipants();
    }, [tgId]);

    const handleBack = () => {
        navigate(`/main/${tgId}`);
    };

    const handleParticipantSelect = (id) => {
        setSelectedParticipant(id);
    };

    const handlePayment = async () => {
        if (!selectedParticipant) return;
        
        try {
            // 1. Получаем текущий турнир для определения цены
            const tournamentRes = await fetch('https://htcupbackend.ru/api/tournaments/current');
            const tournament = await tournamentRes.json();
            
            if (!tournament || !tournament.tournamentPrice) {
                throw new Error('Не удалось получить стоимость турнира');
            }
    
            // 2. Создаем платеж в ЮKassa (тестовый режим)
            const paymentResponse = await fetch('https://api.yookassa.ru/v3/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa('412158:live_KwWVtffxj-Ww7JIh70zoMQmtmNpZlVT4HwTwqIktluM')}`, // Тестовый ключ
                    'Idempotence-Key': uuidv4() // Уникальный ключ идемпотентности
                },
                body: JSON.stringify({
                    amount: {
                        value: tournament.tournamentPrice.toFixed(2),
                        currency: 'RUB'
                    },
                    payment_method_data: {
                        type: 'bank_card'
                    },
                    confirmation: {
                        type: 'redirect',
                        return_url: window.location.href
                    },
                    capture: true,
                    description: `Оплата участия в турнире (${selectedParticipant.fullName})`,
                    metadata: {
                        participantId: selectedParticipant.id,
                        tgId: tgId,
                        tournamentId: tournament.id
                    }
                })
            });
    
            const paymentData = await paymentResponse.json();
    
            if (paymentData.status === 'pending') {
                // 3. Перенаправляем пользователя на страницу оплаты
                window.location.href = paymentData.confirmation.confirmation_url;
                
                // 4. Сохраняем ID платежа для проверки статуса
                localStorage.setItem('yookassa_payment_id', paymentData.id);
            } else {
                throw new Error('Не удалось инициировать платеж');
            }
    
        } catch (error) {
            console.error("Ошибка оплаты:", error);
            // Здесь можно добавить уведомление об ошибке
        }
    };
    
    // Проверка статуса оплаты при возврате
    useEffect(() => {
        const checkPayment = async () => {
            const paymentId = localStorage.getItem('yookassa_payment_id');
            if (paymentId) {
                try {
                    const statusRes = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
                        headers: {
                            'Authorization': `Basic ${btoa('412158:live_KwWVtffxj-Ww7JIh70zoMQmtmNpZlVT4HwTwqIktluM')}`
                        }
                    });
                    const payment = await statusRes.json();
                    
                    if (payment.status === 'succeeded') {
                        // Подтверждаем оплату на нашем сервере
                        const confirmRes = await fetch('https://htcupbackend.ru/api/payment/confirm', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                tgId: tgId,
                                participantId: selectedParticipant.id,
                                paymentData: payment // Отправляем все данные платежа
                            })
                        });
                        
                        if (confirmRes.ok) {
                            localStorage.removeItem('yookassa_payment_id');
                            navigate(`/main/${tgId}`);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка проверки платежа:', error);
                }
            }
        };
        
        checkPayment();
    }, [navigate, tgId, selectedParticipant]);

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button className="payment-back-button" onClick={handleBack}>
                    <img src={backImage} alt="Back" className="payment-back-icon" />
                </button>
                <h2 className="payment-title">Оплата участия</h2>
            </div>
            
            <div className="payment-participants-list">
                {participants.map((participant) => (
                    <div 
                        key={participant.id} 
                        className={`payment-participant-item ${selectedParticipant === participant.id ? "payment-selected" : ""}`}
                        onClick={() => handleParticipantSelect(participant.id)}
                    >
                        <input
                            type="radio"
                            checked={selectedParticipant === participant.id}
                            onChange={() => handleParticipantSelect(participant.id)}
                            className="payment-radio-button"
                        />
                        <span className="payment-participant-id">{participant.id}</span>
                        <span className="payment-participant-name">{participant.fullName}</span>
                    </div>
                ))}
            </div>
            
            <button 
                className={`payment-button ${!selectedParticipant ? "payment-disabled" : ""}`}
                onClick={handlePayment}
                disabled={!selectedParticipant}
            >
                Оплатить
            </button>
        </div>
    );
}