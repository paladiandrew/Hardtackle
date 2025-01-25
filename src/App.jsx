import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainScreen from "./MainScreen/MainScreen";
import Tournament from "./Tournament/Tournament";
import Statistics from "./Statistics/Statistics";
import Registration from "./Registration/Registration";
import ParticipantsList from "./ParticipantsList/ParticipantsList";
import PastResults from "./PastResults/PastResults";
import MiniAppMain from "./MiniAppMain/MiniAppMain";

export default function App() {
    console.log('App started');
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/main" element={<MiniAppMain />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/participants" element={<ParticipantsList />} />
                <Route path="/past-results" element={<PastResults />} />
                <Route path="/tournament/:code" element={<Tournament />} />
                <Route path="/statistics/:code" element={<Statistics />} />
            </Routes>
        </Router>
    );
}