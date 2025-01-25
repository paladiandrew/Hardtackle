// src/ParticipantsList/ParticipantsList.jsx
import React from "react";

const participants = [
    { number: 1, name: 'Алексей' },
    { number: 2, name: 'Мария' },
    { number: 3, name: 'Дмитрий' },
    // Добавьте остальных участников
];

export default function ParticipantsList() {
    return (
        <div>
            <h2>Список участников</h2>
            {participants.map((participant) => (
                <div key={participant.number} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
                    <span>{participant.number}</span>
                    <span>{participant.name}</span>
                </div>
            ))}
        </div>
    );
}