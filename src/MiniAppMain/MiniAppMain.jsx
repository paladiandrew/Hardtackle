import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    const { tgId } = useParams();
    const navigate = useNavigate();
    const [tournamentStatus, setTournamentStatus] = useState({
        exists: false,
        isRegistrationOpen: false,
        maxQuantity: 0
    });
    const [participants, setParticipants] = useState([]);
    const [paidParticipants, setPaidParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournamentStatus = async () => {
            try {
                const response = await fetch("https://htcupbackend.ru/api/tournaments/current");
                const data = await response.json();
                
                if (data) {
                    setTournamentStatus({
                        exists: true,
                        isRegistrationOpen: data.isRegistrationOpen || false,
                        maxQuantity: data.maxQuantity || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching tournament status:", error);
            }
        };

        const fetchParticipants = async () => {
            try {
                const [unpaidResponse, paidResponse] = await Promise.all([
                    fetch(`https://htcupbackend.ru/api/payment/participants?tgId=${tgId}`),
                    fetch(`https://htcupbackend.ru/api/payment/paid-participants?tgId=${tgId}`)
                ]);
                
                const unpaidData = await unpaidResponse.json();
                const paidData = await paidResponse.json();
                
                setParticipants(unpaidData);
                setPaidParticipants(paidData);
            } catch (error) {
                console.error("Error fetching participants:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentStatus();
        fetchParticipants();
    }, [tgId]);

    const navigateWithState = (path) => {
        navigate(`${path}/${tgId}`);
    };

    // Проверяем, есть ли участники для оплаты (неоплаченные) или уже оплаченные
    const hasAnyParticipants = participants.length > 0 || paidParticipants.length > 0;

    if (loading) {
        return (
            <div className="miniapp-container">
                <h1 className="tournament-title">Hardtackle Trout Cup</h1>
                <div className="buttons-container">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="miniapp-container">
            <h1 className="tournament-title">Hardtackle Trout Cup</h1>
            <div className="buttons-container">
                <button 
                    className={`miniapp-button ${!tournamentStatus.exists || !tournamentStatus.isRegistrationOpen ? "miniapp-button-disabled" : ""}`} 
                    onClick={() => tournamentStatus.exists && tournamentStatus.isRegistrationOpen && navigateWithState("/registration")}
                    disabled={!tournamentStatus.exists || !tournamentStatus.isRegistrationOpen}
                >
                    Регистрация
                </button>
                <button 
                    className={`miniapp-button ${!tournamentStatus.exists ? "miniapp-button-disabled" : ""}`}
                    onClick={() => tournamentStatus.exists && navigateWithState("/participants")}
                    disabled={!tournamentStatus.exists}
                >
                    Список участников
                </button>
                <button 
                    className={`miniapp-button ${!tournamentStatus.exists || !hasAnyParticipants ? "miniapp-button-disabled" : ""}`}
                    onClick={() => tournamentStatus.exists && hasAnyParticipants && navigateWithState("/payment")}
                    disabled={!tournamentStatus.exists || !hasAnyParticipants}
                >
                    Личный кабинет
                </button>
            </div>
        </div>
    );
}