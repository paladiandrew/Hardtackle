import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backImage from "./images/back.png";
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
            // Здесь должна быть реализация оплаты через ЮKassa
            // После успешной оплаты:
            const response = await fetch(`https://htcupbackend.ru/api/payment/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tgId,
                    participantId: selectedParticipant,
                    transactionId: "generated_transaction_id" // Заменить на реальный ID транзакции
                })
            });
            
            if (response.ok) {
                navigate(`/main/${tgId}`);
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

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