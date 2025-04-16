import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ParticipantsList.css";

export default function ParticipantsList() {
    const { tgId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnpaidParticipants = async () => {
            try {
                const response = await fetch(`https://htcupbackend.ru/api/participants/unpaid`);
                const data = await response.json();
                setParticipants(data);
            } catch (error) {
                console.error("Ошибка загрузки участников:", error);
            }
        };
        fetchUnpaidParticipants();
    }, [tgId]);

    const toggleParticipant = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };

    const proceedToPayment = async () => {
        try {
            // Отправляем выбранных участников на сервер
            await fetch(`https://htcupbackend.ru/api/participants/mark-for-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tgId,
                    participantIds: selectedIds
                })
            });
            
            // Переходим на страницу оплаты
            navigate(`/payment/${tgId}`);
        } catch (error) {
            console.error("Ошибка при отметке участников:", error);
        }
    };

    return (
        <div className="participants-list">
            <h2>Выберите участников для оплаты</h2>
            
            <div className="participants-container">
                {participants.map(participant => (
                    <div 
                        key={participant.id}
                        className={`participant-card ${selectedIds.includes(participant.id) ? "selected" : ""}`}
                        onClick={() => toggleParticipant(participant.id)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(participant.id)}
                            onChange={() => toggleParticipant(participant.id)}
                        />
                        <div className="participant-info">
                            <span className="participant-name">{participant.fullName}</span>
                            <span className="participant-code">{participant.code}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                className="proceed-button"
                onClick={proceedToPayment}
                disabled={selectedIds.length === 0}
            >
                Перейти к оплате ({selectedIds.length})
            </button>
        </div>
    );
}