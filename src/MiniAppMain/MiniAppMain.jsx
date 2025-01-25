// src/MainScreen/MainScreen.jsx
import React from "react";
import { Link } from "react-router-dom";
import './MiniAppMain.css';

export default function MiniAppMain() {
    return (
        <div className="container">
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