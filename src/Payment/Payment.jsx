import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backImage from "./images/back.png";
import ErrorModal from '../components/ErrorModal';
import "./Payment.css";

export default function Payment() {
    const [error, setError] = useState(null);
    const { tgId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [paidParticipants, setPaidParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [maxQuantity, setMaxQuantity] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Загружаем данные турнира
                const tournamentResponse = await fetch("https://htcupbackend.ru/api/tournaments/current");
                const tournamentData = await tournamentResponse.json();
                setMaxQuantity(tournamentData.maxQuantity || 0);

                // Загружаем участников для оплаты
                const participantsResponse = await fetch(`https://htcupbackend.ru/api/payment/participants?tgId=${tgId}`);
                const participantsData = await participantsResponse.json();
                setParticipants(participantsData);

                // Загружаем уже оплаченных участников
                const paidResponse = await fetch(`https://htcupbackend.ru/api/payment/paid-participants?tgId=${tgId}`);
                const paidData = await paidResponse.json();
                setPaidParticipants(paidData);
            } catch (error) {
                setError(error.message || "Ошибка загрузки данных");
            }
        };
        
        fetchData();
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

    const handleUnregister = async (userId) => {
        try {
            const response = await fetch('https://htcupbackend.ru/api/payment/unregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tgId })
            });
            
            const result = await response.json();
            if (result.success) {
                // Обновляем списки после успешной отмены
                const updatedPaid = paidParticipants.filter(p => p.id !== userId);
                setPaidParticipants(updatedPaid);
                
                // Если отмененный участник был в списке для оплаты, добавляем его обратно
                const unregisteredParticipant = paidParticipants.find(p => p.id === userId);
                if (unregisteredParticipant) {
                    setParticipants(prev => [...prev, { 
                        ...unregisteredParticipant, 
                        isPaid: false 
                    }].sort((a, b) => a.id - b.id));
                }
            } else {
                setError(result.error || "Ошибка при отмене регистрации");
            }
        } catch (error) {
            setError(error.message || "Ошибка при отмене регистрации");
        }
    };

    // Фильтруем участников по maxQuantity
    const filteredParticipants = participants.filter(participant => participant.id <= maxQuantity);
    const filteredPaidParticipants = paidParticipants.filter(participant => participant.id <= maxQuantity);

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
                {/* Список оплаченных участников */}
                {filteredPaidParticipants.length > 0 && (
                    <div className="payment-paid-section">
                        <h3 className="payment-section-title">Оплаченные участники</h3>
                        <div className="payment-paid-list">
                            {filteredPaidParticipants.map((participant) => (
                                <div key={participant.id} className="payment-paid-item">
                                    <span className="payment-paid-id">{participant.id}</span>
                                    <span className="payment-paid-name">{participant.fullName}</span>
                                    <span className="payment-paid-code">{participant.code}</span>
                                    <button 
                                        className="payment-unregister-button"
                                        onClick={() => handleUnregister(participant.id)}
                                    >
                                        Снять с регистрации
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Список участников для оплаты */}
                {filteredParticipants.length > 0 ? (
                    <>
                        <h3 className="payment-section-title">Участники для оплаты</h3>
                        <div className="payment-page-participants-list">
                            {filteredParticipants.map((participant) => (
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
                    </>
                ) : (
                    <p className="payment-page-no-participants">Нет доступных участников для оплаты</p>
                )}
            </div>
        </div>
    );
}