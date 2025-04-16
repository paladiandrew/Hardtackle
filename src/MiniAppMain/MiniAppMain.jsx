import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./MiniAppMain.css";

export default function MiniAppMain() {
    const { tgId } = useParams();
    const navigate = useNavigate();
    const navigateWithState = (path) => {
        navigate(`${path}/${tgId}`);
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