import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    const { tgId } = useParams();
    const navigate = useNavigate();
    const [tournamentStatus, setTournamentStatus] = useState({
        exists: false,
        isRegistrationOpen: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournamentStatus = async () => {
            try {
                const response = await fetch("https://htcupbackend.ru/api/tournaments/current");
                const data = await response.json();
                
                if (data) {
                    setTournamentStatus({
                        exists: true,
                        isRegistrationOpen: data.isRegistrationOpen || false
                    });
                }
            } catch (error) {
                console.error("Error fetching tournament status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentStatus();
    }, []);

    const navigateWithState = (path) => {
        navigate(`${path}/${tgId}`);
    };

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
                    className={`miniapp-button ${!tournamentStatus.exists || !tournamentStatus.isRegistrationOpen ? "miniapp-button-disabled" : ""}`}
                    onClick={() => tournamentStatus.exists && tournamentStatus.isRegistrationOpen && navigateWithState("/payment")}
                    disabled={!tournamentStatus.exists || !tournamentStatus.isRegistrationOpen}
                >
                    Оплата
                </button>
            </div>
        </div>
    );
}