import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    const [tgId, setTgId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const startParam = tg.startParam; // Берём ID из параметра ссылки
            if (startParam) {
                setTgId(startParam);
                return;
            }
            
            const user = tg.initDataUnsafe?.user;
            if (user?.id) {
                setTgId(user.id);
                localStorage.setItem("tgUser", JSON.stringify(user));
            }
        }
    }, []);

    const navigateWithState = (path) => {
        navigate(path, { state: { tgId } });
    };

    return (
        <div className="miniapp-container">
            <h1 className="tournament-title">Hardtackle Trout Cup</h1>
            <div className="buttons-container">
                <button 
                    className="miniapp-button" 
                    onClick={() => navigateWithState("/registration")}
                >
                    Регистрация
                </button>
                <button 
                    className="miniapp-button" 
                    onClick={() => navigateWithState("/participants")}
                >
                    Список участников
                </button>
                <button 
                    className="miniapp-button" 
                    onClick={() => navigateWithState("/payment")}
                >
                    Оплата
                </button>
            </div>
        </div>
    );
}