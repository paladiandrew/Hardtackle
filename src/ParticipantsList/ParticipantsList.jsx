import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import backImage from "./images/back.png";
import "./ParticipantsList.css";

export default function ParticipantsList() {
    const [participants, setParticipants] = useState([]);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryParams = new URLSearchParams(window.location.search);
    const tgId = state?.tgId || queryParams.get('tgId');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [participantsRes, tournamentRes] = await Promise.all([
                    fetch("https://htcupbackend.ru/api/participants"),
                    fetch("https://htcupbackend.ru/api/tournaments/current")
                ]);
                
                const participantsData = await participantsRes.json();
                const tournamentData = await tournamentRes.json();
                
                setParticipants(participantsData);
                setIsRegistrationOpen(tournamentData.isRegistrationOpen);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchData();
    }, []);

    const handleBack = () => {
        navigate("/main");
    };

    const handlePaymentClick = (participant) => {
        setSelectedParticipant(participant);
        setShowConfirmation(true);
    };

    const confirmPayment = async () => {
        try {
            await fetch(`https://htcupbackend.ru/api/participants/${selectedParticipant.id}/mark-for-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tgId: window.Telegram.WebApp.initDataUnsafe.user.id })
            });
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error marking for payment:", error);
        }
    };

    return (
        <div className="participants-container">
            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <p>Вы хотите оплатить данного участника?</p>
                        <div className="confirmation-buttons">
                            <button className="cancel-button" onClick={() => setShowConfirmation(false)}>
                                Отмена
                            </button>
                            <button className="confirm-button" onClick={confirmPayment}>
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="participants-header">
                <button className="participants-back-button" onClick={handleBack}>
                    <img src={backImage} alt="Back" className="participants-back-icon" />
                </button>
                <h2 className="participants-title">Список участников</h2>
            </div>
            
            <div className="participants-list">
                {participants.map((participant) => (
                    <div 
                        key={participant.id} 
                        className={`participant-item ${participant.isPaid ? "paid" : "unpaid"}`}
                    >
                        <span className="participant-id">{participant.id + 1}</span>
                        <span className="participant-name">{participant.fullName}</span>
                        {isRegistrationOpen && !participant.isPaid && participant.id < 52 && (
                            <button 
                                className="payment-button"
                                onClick={() => handlePaymentClick(participant)}
                            >
                                Ю
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}