import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainScreen from "./MainScreen/MainScreen";
import Tournament from "./Tournament/Tournament";
import Statistics from "./Statistics/Statistics";

export default function App() {
    //return <MainScreen />;
    console.log('App started');
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/tournament/:code" element={<Tournament />} />
                <Route path="/statistics/:code" element={<Statistics />} />
            </Routes>
        </Router>
    );
}
