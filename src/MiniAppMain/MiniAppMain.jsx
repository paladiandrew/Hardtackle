// src/MainScreen/MainScreen.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function MiniAppMain() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Мини апп</h1>
            <Link to="/registration">
                <button>Регистрация</button>
            </Link>
            <Link to="/past-results">
                <button>Результаты прошлых этапов</button>
            </Link>
        </div>
    );
}