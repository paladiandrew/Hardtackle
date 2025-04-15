// src/MiniAppMain.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            localStorage.setItem("tgUser", JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
        }
    }, []);

    return (
        <div className="miniapp-container">
            <div className="buttons-container">
                <Link to="/registration" className="miniapp-button">
                    Регистрация
                </Link>
                <Link to="/participants" className="miniapp-button">
                    Список участников
                </Link>
                <a href="https://htcup.ru" className="miniapp-button external">
                    Турнир
                </a>
                <Link to="/payment" className="miniapp-button">
                    Оплата
                </Link>
            </div>
        </div>
    );
}