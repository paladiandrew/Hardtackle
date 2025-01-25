// src/MainScreen/MainScreen.jsx
import React from "react";
import { Link } from "react-router-dom";
import './MiniAppMain.css'; // Импортируем стили

export default function MiniAppMain() {
    return (
        <div className="container">
            <Link to="/registration">
                <button className="button">Регистрация</button>
            </Link>
            <Link to="/past-results">
                <button className="button">Результаты прошлых этапов</button>
            </Link>
        </div>
    );
}