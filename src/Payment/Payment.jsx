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
    const [showUnregisterConfirm, setShowUnregisterConfirm] = useState(false);
    const [participantToUnregister, setParticipantToUnregister] = useState(null);
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
                console.log(participantsData);
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

    const confirmUnregister = (userId) => {
        setParticipantToUnregister(userId);
        setShowUnregisterConfirm(true);
    };

    const handleUnregister = async () => {
        try {
            const userId = participantToUnregister;
            const response = await fetch('https://htcupbackend.ru/api/payment/unregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tgId })
            });
            
            const result = await response.json();
            if (result.success) {
                // Показываем уведомление об успешном снятии
                setError(result.message || "Участник успешно снят с регистрации");
                
                // Обновляем списки
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
    
                // Если это был последний участник, переходим на главную
                if (result.remainingUsersCount === 0) {
                    setTimeout(() => navigate(`/main/${tgId}`), 1500);
                }
            } else {
                setError(result.error || "Ошибка при отмене регистрации");
            }
        } catch (error) {
            setError(error.message || "Ошибка при отмене регистрации");
        } finally {
            setShowUnregisterConfirm(false);
            setParticipantToUnregister(null);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                // Можно добавить уведомление об успешном копировании
                console.log('Код скопирован в буфер обмена');
            })
            .catch(err => {
                console.error('Ошибка при копировании:', err);
            });
    };

    // Фильтруем участников по maxQuantity
    const filteredParticipants = participants.filter(participant => participant.id <= maxQuantity);
    const filteredPaidParticipants = paidParticipants.filter(participant => participant.id <= maxQuantity);

    // Проверяем, является ли текущий пользователь участником
    const isCurrentUserParticipant = (participantTgId) => {
        return participantTgId === tgId;
    };

    return (
        <div className="payment-page">
            {error && <ErrorModal message={error} />}
            
            {showUnregisterConfirm && (
                <div className="payment-confirm-modal">
                    <div className="payment-confirm-content">
                        <h3>Подтверждение</h3>
                        <p>Вы действительно хотите снять участника с регистрации?</p>
                        <div className="payment-confirm-buttons">
                            <button 
                                className="payment-confirm-button payment-confirm-cancel"
                                onClick={() => setShowUnregisterConfirm(false)}
                            >
                                Отмена
                            </button>
                            <button 
                                className="payment-confirm-button payment-confirm-ok"
                                onClick={handleUnregister}
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="payment-page-header">
                <button className="payment-page-back-button" onClick={handleBack}>
                    <img src={backImage} alt="Back" className="payment-page-back-icon" />
                </button>
                <h2 className="payment-page-title">Оплата участия</h2>
            </div>
            
            <div className="payment-page-content">
                {/* Оплаченные участники */}
                {filteredPaidParticipants.length > 0 && (
                    <div className="payment-paid-section">
                        <h3 className="payment-section-title">Оплаченные участники</h3>
                        <div className="payment-paid-list">
                        {filteredPaidParticipants.map((participant) => (
    <div key={participant.id} className="payment-paid-item">
        <div className="payment-page-radio-container">
            <span className="payment-paid-id">{participant.id}</span>
        </div>
        
        <div className="payment-participant-info">
            <span className="payment-paid-name">{participant.fullName}</span>
            <button 
                className="payment-unregister-button"
                onClick={() => confirmUnregister(participant.id)}
            >
                Снять с регистрации
            </button>
        </div>
        
        <div className="payment-code-container">
            <button 
                className="payment-code-button"
                onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(participant.code);
                }}
            >
                {participant.code}
            </button>
        </div>
    </div>
))}
                        </div>
                    </div>
                )}

                {/* Участники для оплаты */}
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
                                    <div className="payment-page-radio-container">
                                        <input
                                            type="radio"
                                            checked={selectedParticipant === participant.id}
                                            onChange={() => handleParticipantSelect(participant.id)}
                                            className="payment-page-radio-button"
                                        />
                                        <span className="payment-page-participant-id">{participant.id}</span>
                                    </div>
                                    
                                    <div className="payment-participant-info">
                                        <span className="payment-paid-name">{participant.fullName}</span>
                                        {isCurrentUserParticipant(participant.tgId) && (
                                            <button 
                                                className="payment-unregister-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmUnregister(participant.id);
                                                }}
                                            >
                                                Снять с регистрации
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="payment-code-container">
                                        <button 
                                            className="payment-code-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(participant.code);
                                            }}
                                        >
                                            {participant.code}
                                        </button>
                                    </div>
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