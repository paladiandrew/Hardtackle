// src/Registration/Registration.jsx
import React, { useState } from "react";

export default function Registration() {
    const [name, setName] = useState("");

    const handlePayment = () => {
        // Здесь должна быть логика платежа через ЮKassa
        console.log("Оплата совершена");
    };

    return (
        <div style={{ padding: '20px' }}>
            <img src="/path/to/back_icon.png" alt="Назад" style={{ cursor: 'pointer' }} />
            <h2>Регистрация</h2>
            <input 
                type="text" 
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
            />
            <button onClick={handlePayment}>Оплатить через ЮKassa</button>
        </div>
    );
}