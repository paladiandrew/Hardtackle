import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    const [tgId, setTgId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Парсим параметры URL
        const queryParams = new URLSearchParams(window.location.search);
        const urlTgId = queryParams.get('tgId');
        
        if (urlTgId) {
            console.log("tgId из URL:", urlTgId);
            setTgId(urlTgId);
            localStorage.setItem("tgUser", urlTgId);
            return;
        }
    
        // Если нет в URL, пробуем Telegram WebApp (на всякий случай)
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;
            if (user?.id) {
                setTgId(user.id);
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