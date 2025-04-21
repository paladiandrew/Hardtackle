import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainScreen.css";

const server_url = process.env.REACT_APP_API_URL;

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
                document.querySelector('.fisrt-page-background-image').style.backgroundImage = `url(${url})`;
            });
    }, []);
    const checkCodeAndNavigate = async () => {
        if (pinCode) {
            try {
                const response = await fetch(`${server_url}/api/user/${pinCode}`);
                if (response.ok) {
                    navigate(`/tournament/${pinCode}`);
                } else if (response.status === 404) {
                    setErrorMessage("Incorrect password. Please try again.");
                } else {
                    setErrorMessage("An error occurred. Please try again.");
                }
            } catch (error) {
                setErrorMessage("Incorrect password. Please try again.");
            }
        } else {
            setErrorMessage("Please enter a password.");
        }
    };
    return (
        <div className="fisrt-page-content-wrapper">
            <div className="fisrt-page-background-image"></div>
            <div className="fisrt-page-content-overlay">
                <div className="fisrt-page-title"></div>
                <div className="fisrt-page-dates"></div>
                <div className="fisrt-page-stage"></div>
                <div className="fisrt-page-enter-number">
                    <input
                        type="text"
                        placeholder="Enter password"
                        value={pinCode}
                        onChange={handleInputChange}
                    />
                </div>
                {errorMessage && <div className="fisrt-page-error-message">{errorMessage}</div>}
                <button className="fisrt-page-submit-button" onClick={checkCodeAndNavigate}>
                    Continue
                </button>
            </div>
        </div>
    );
}