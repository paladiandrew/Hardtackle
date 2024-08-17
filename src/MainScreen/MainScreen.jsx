import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainScreen.css";

const server_url = "https://paladiandrew-hardtackle-server-638d.twc1.net";

export default function MainScreen() {
    const navigate = useNavigate();
    const [pinCode, setPinCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");

    const handleInputChange = (e) => {
        setPinCode(e.target.value);
    };
    useEffect(() => {
        fetch(`${server_url}/api/get_photo`)
         .then(response => response.blob())
         .then(blob => {
                const url = URL.createObjectURL(blob);
                setPhotoUrl(url);
            });
    }, []);
    const checkCodeAndNavigate = async () => {
        if (pinCode) {
            try {
                const response = await fetch(`${server_url}/api/user/${pinCode}`);
                if (response.ok) {
                    navigate(`/tournament/${pinCode}`);
                } else if (response.status === 404) {
                    setErrorMessage("Код не найден. Пожалуйста, попробуйте снова.");
                } else {
                    setErrorMessage("Произошла ошибка. Пожалуйста, попробуйте снова.");
                }
            } catch (error) {
                setErrorMessage("Код не найден. Пожалуйста, попробуйте снова.");
            }
        } else {
            setErrorMessage("Пожалуйста, введите код");
        }
    };
    return (
        <div className="content" style={{ backgroundImage: `url(${photoUrl})` }}>
            <div className="title">TROUT CUP</div>
            <div className="dates">24-25</div>
            <div className="stage">1 stage 24-25</div>
            <div className="enter-number">
                <input
                    type="text"
                    placeholder="Enter password"
                    value={pinCode}
                    onChange={handleInputChange}
                />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button className="submit-button" onClick={checkCodeAndNavigate}>
                Continue
            </button>
        </div>
    );
}
