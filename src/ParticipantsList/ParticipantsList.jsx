import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backImage from "./images/back.png";
import ErrorModal from '../components/ErrorModal';
import "./ParticipantsList.css";

export default function ParticipantsList() {
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [markedParticipants, setMarkedParticipants] = useState([]);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const navigate = useNavigate();
    const { tgId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [participantsRes, tournamentRes, markedRes] = await Promise.all([
                    fetch("https://htcupbackend.ru/api/participants/list"),
                    fetch("https://htcupbackend.ru/api/tournaments/current"),
                    fetch(`https://htcupbackend.ru/api/payment/participants?tgId=${tgId}`)
                ]);
                
                const participantsData = await participantsRes.json();
                const tournamentData = await tournamentRes.json();
                const markedData = await markedRes.json();
                
                setParticipants(participantsData);
                setIsRegistrationOpen(tournamentData.isRegistrationOpen);
                setMarkedParticipants(markedData.map(user => user.id));
            } catch (error) {
                setError(error.message || "Ошибка загрузки данных");
            }
        };
        
        fetchData();
    }, [tgId]);

    const handleBack = () => {
        navigate(`/main/${tgId}`);
    };

    const handlePaymentClick = (participant) => {
        setSelectedParticipant(participant);
        setShowConfirmation(true);
    };

    const confirmPayment = async () => {
        try {
            await fetch(`https://htcupbackend.ru/api/participants/mark-for-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    tgId,
                    participantId: selectedParticipant.id 
                })
            });
            setShowConfirmation(false);
            navigate(`/payment/${tgId}`);
        } catch (error) {
            setError(error.message || "Ошибка загрузки данных");
        }
    };

    return (
        <div className="participants-container">
            {error && <ErrorModal message={error} />}
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
                        <span className="participant-id">{participant.id}</span>
                        <span className="participant-name">{participant.fullName}</span>
                        {isRegistrationOpen && !participant.isPaid && !markedParticipants.includes(participant.id) && (
                            <button 
                                className="confirmation-payment-button"
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