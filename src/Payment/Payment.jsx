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
        if (!selectedParticipantId) return;
        
        try {
          const response = await fetch('https://htcupbackend.ru/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId: selectedParticipantId,
              tgId: tgId,
              returnUrl: `https://htcup.ru/main/${tgId}`
            })
          });
      
          const paymentData = await response.json();
          console.log("Received payment data:", paymentData); // Логируем ответ
      
          if (paymentData.confirmation?.confirmation_url) {
            console.log("Redirecting to:", paymentData.confirmation.confirmation_url);
            window.location.href = paymentData.confirmation.confirmation_url; // Редирект
          } else {
            console.error("No confirmation URL found");
          }
        } catch (error) {
          console.error("Payment error:", error);
        }
      };
    
    // Проверка статуса оплаты при возврате
    useEffect(() => {
        const checkPayment = async () => {
            const paymentId = localStorage.getItem('yookassa_payment_id');
            if (paymentId) {
                console.log(paymentId)
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