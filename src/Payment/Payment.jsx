import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backImage from "./images/back.png";
import ErrorModal from '../components/ErrorModal';
import "./Payment.css";

export default function Payment() {
    const [error, setError] = useState(null);
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
            } catch (error) {
                setError(error.message || "Ошибка загрузки участников");
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
            const response = await fetch('https://htcupbackend.ru/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantId: selectedParticipant,
                    tgId: tgId,
                    returnUrl: `https://htcup.ru/participants/${tgId}`
                })
            });
            
            const paymentData = await response.json();
            if (paymentData.confirmation?.confirmation_url) {
                window.location.href = paymentData.confirmation.confirmation_url;
            } else {
                console.error("No confirmation URL found");
            }
        } catch (error) {
            setError(error.message || "Ошибка загрузки участников");
        }
    };

    return (
        <div className="payment-page">
            {error && <ErrorModal message={error} />}
            <div className="payment-page-header">
                <button className="payment-page-back-button" onClick={handleBack}>
                    <img src={backImage} alt="Back" className="payment-page-back-icon" />
                </button>
                <h2 className="payment-page-title">Оплата участия</h2>
            </div>
            
            <div className="payment-page-content">
                <div className="payment-page-participants-list">
                    {participants.map((participant) => (
                        <div 
                            key={participant.id} 
                            className={`payment-page-participant-item ${selectedParticipant === participant.id ? "payment-page-selected" : ""}`}
                            onClick={() => handleParticipantSelect(participant.id)}
                        >
                            <input
                                type="radio"
                                checked={selectedParticipant === participant.id}
                                onChange={() => handleParticipantSelect(participant.id)}
                                className="payment-page-radio-button"
                            />
                            <span className="payment-page-participant-id">{participant.id}</span>
                            <span className="payment-page-participant-name">{participant.fullName}</span>
                        </div>
                    ))}
                </div>
                
                <button 
                    className={`payment-page-button ${!selectedParticipant ? "payment-page-disabled" : ""}`}
                    onClick={handlePayment}
                    disabled={!selectedParticipant}
                >
                    Оплатить
                </button>
            </div>
        </div>
    );
}