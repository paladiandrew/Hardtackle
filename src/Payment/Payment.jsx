// src/Payment/Payment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import backImage from "./images/back.png";
import "./Payment.css";

export default function Payment() {
    const { state } = useLocation();
    const queryParams = new URLSearchParams(window.location.search);
    const tgId = state?.tgId || queryParams.get('tgId');
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`https://htcupbackend.ru/api/participants?tgId=${tgId}`);
                const data = await response.json();
                setParticipants(data);
            } catch (error) {
                console.error("Error fetching participants:", error);
            }
        };
        
        fetchParticipants();
    }, []);

    const handleBack = () => {
        navigate("/main");
    };

    const handleParticipantSelect = (id) => {
        setSelectedParticipant(id === selectedParticipant ? null : id);
    };

    const handlePayment = async () => {
        if (!selectedParticipant) return;
        
        try {
            // Здесь должна быть реализация оплаты через ЮKassa
            // После успешной оплаты:
            const response = await fetch(`/api/participants/${selectedParticipant}/mark-as-paid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tgId: tgId,
                    transactionId: "generated_transaction_id" // Заменить на реальный ID транзакции
                })
            });
            
            if (response.ok) {
                navigate("/main");
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
                        <span className="payment-participant-id">{participant.id + 1}</span>
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