import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ParticipantsList.css";

export default function ParticipantsList() {
    const { tgId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`https://htcupbackend.ru/api/participants`);
                const data = await response.json();
                setParticipants(data);
            } catch (error) {
                console.error("Error fetching participants:", error);
            }
        };
        
        fetchParticipants();
    }, [tgId]);

    const handleSelectParticipant = (id) => {
        setSelectedParticipants(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };

    const handleConfirmPayment = async () => {
        try {
            await Promise.all(
                selectedParticipants.map(id => 
                    fetch(`https://htcupbackend.ru/api/participantsList/mark-for-payment/${id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ tgId })
                    })
                )
            );
            
            navigate(`/payment/${tgId}`);
        } catch (error) {
            console.error("Error marking participants:", error);
        }
    };

    return (
        <div className="participants-list-container">
            <h2>Выберите участников для оплаты</h2>
            
            <div className="participants-grid">
                {participants.map(participant => (
                    <div 
                        key={participant.id}
                        className={`participant-card ${selectedParticipants.includes(participant.id) ? "selected" : ""}`}
                        onClick={() => handleSelectParticipant(participant.id)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={() => handleSelectParticipant(participant.id)}
                        />
                        <span>{participant.fullName}</span>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={handleConfirmPayment}
                disabled={selectedParticipants.length === 0}
            >
                Подтвердить выбор ({selectedParticipants.length})
            </button>
        </div>
    );
}