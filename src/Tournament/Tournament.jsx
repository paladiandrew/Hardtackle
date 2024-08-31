import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import vectorImage from './images/Vector.png';
import {io} from 'socket.io-client';
import './Tournament.css';

const server_url = process.env.REACT_APP_API_URL;;


const socket = io(`${server_url}`, {
    transports: ['websocket', 'polling'],
    secure: true,
  });

socket.on("connect", () => {
    console.log("Connected to WebSocket server");
});

const Tournament = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    
    const [activeCircle, setActiveCircle] = useState(null);
    const [playerScoreInput, setPlayerScoreInput] = useState(0);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${server_url}/api/user/${code}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUserData(data);
                if (state && state.activeCircle && data.circles.find(circle => circle.number === state.activeCircle)) {
                    const newActiveCircle = data.circles.find(circle => circle.number === state.activeCircle);
                    setActiveCircle(newActiveCircle);
                    setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
                  } else {
                    const newActiveCircle = data.circles.find(circle => circle.status === 'active');
                    if (newActiveCircle) {
                      setActiveCircle(newActiveCircle);
                      setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
                    } else {
                      setActiveCircle(data.circles[0]);
                      setPlayerScoreInput(data.circles[0].fishCount);
                    }
                  }
            } catch (error) {
                setError(error.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [code, state]);



    useEffect(() => {
        const handleUserUpdated = (data) => {
            const { updatedUserData, activeCircleNumber } = data;
            if (userData && userData.code === updatedUserData.code) {
                setUserData(updatedUserData);
                const updatedCircle = updatedUserData.circles.find(c => c.number === activeCircleNumber);
                setActiveCircle(updatedCircle);
                setPlayerScoreInput(updatedCircle.playerGame.fishCount);
            } else if (userData) {
                const currUpdatedActiveCircle = updatedUserData.circles.find(circle => circle.number === activeCircleNumber && circle.opponentGame.number === userData.player_id && circle.status === 'active');
                let number = activeCircle.number;
                if (currUpdatedActiveCircle){
                const updatedCircles = userData.circles.map(circle => {
                    const updatedCircle = updatedUserData.circles.find(c => c.status === "active" && c.opponentGame.number === circle.playerGame.number && circle.opponentGame.number === c.playerGame.number && circle.status === 'active');
                    if (updatedCircle) {
                        number = circle.number;
                        return {
                            ...circle,
                            opponentGame: {
                                ...circle.opponentGame,
                                fishCount: updatedCircle.playerGame.fishCount,
                                approveState: updatedCircle.playerGame.approveState,
                            },
                            playerGame: {
                                ...circle.playerGame,
                                fishCount: updatedCircle.opponentGame.fishCount,
                                approveState: updatedCircle.opponentGame.approveState,  
                            } 
                        };
                    }
                    return circle;
                });
                setUserData(prevUserData => ({
                    ...prevUserData,
                    circles: updatedCircles,
                }));
                const newActiveCircle = updatedCircles.find(circle => circle.opponentGame.number === currUpdatedActiveCircle.playerGame.number && circle.playerGame.number === currUpdatedActiveCircle.opponentGame.number && circle.status === 'active');
                setActiveCircle(newActiveCircle);
                setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
                }
            }
        };

        const handleAllUsersUpdated = (updatedUsersData) => {
            const currentUser = updatedUsersData.find(user => user.code === code);
            if (currentUser) {
                setUserData(currentUser);
                let currUpdatedActiveCircle = currentUser.circles.find(circle => circle.status === 'active');
                 if (!currUpdatedActiveCircle) {
                currUpdatedActiveCircle = currentUser.circles.find(circle => circle.number === 1);
                }
                setPlayerScoreInput(currUpdatedActiveCircle.playerGame.fishCount);
                setActiveCircle(currUpdatedActiveCircle);
            }
        };
    
        socket.on('allUsersUpdated', handleAllUsersUpdated);
        socket.on('userUpdated', handleUserUpdated);
        return () => {
            socket.off('allUsersUpdated', handleAllUsersUpdated);
            socket.off('userUpdated', handleUserUpdated);
        };
    }, [userData]);

    const handleCircleClick = (circle) => {
        setActiveCircle(circle);
        if (circle.status === 'active') setPlayerScoreInput(circle.playerGame.fishCount);
    };


    const navigateToTournament = () => {
        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });
        navigate(`/statistics/${code}`);
    };

    const updateApproveState = async () => {
        if (!activeCircle || activeCircle.status !== "active" || !userData) return;
        try {
            const response = await fetch(`${server_url}/api/update-approve-state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userData: userData, activeCircleNumber: activeCircle.number}),
            });
    
            if (!response.ok) setError('Failed to update approve state');
        } catch (error) {
            setError('Error updating approve state:', error);
        }
    };

    const handleScoreInputChange = (e) => {
        let value = e.target.value;
        if (value === '' || isNaN(value) || parseInt(value) > 99) {
            value = 0;
        } else {
            value = parseInt(value);
        }
        setPlayerScoreInput(value);
    };
    

    const handleScoreInputBlur = async () => {
        let newPlayerScoreInput;
        if (playerScoreInput === '' || isNaN(playerScoreInput)) {
            setPlayerScoreInput(0);
            newPlayerScoreInput = 0;
        } else {
            newPlayerScoreInput = playerScoreInput;
        }
        const activeCircleIndex = userData.circles.findIndex(circle => circle.number === activeCircle.number && circle.status === 'active');
        if (activeCircleIndex !== -1) {
            let updatedUserData = userData;
            updatedUserData.circles[activeCircleIndex].playerGame.fishCount = newPlayerScoreInput;
            setPlayerScoreInput(newPlayerScoreInput);
            setUserData(updatedUserData);
            setActiveCircle( updatedUserData.circles[activeCircleIndex]);
            try {
                const response = await fetch(`${server_url}/api/update-score`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({userData: userData, activeCircleNumber: activeCircle.number}),
                });
    
                if (response.ok) {

                } else {
                    setError('Failed to update score');
                }
            } catch (error) {
                setError('Error updating score:', error);
            }
        }
    };
    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <article className="playerCard">
            <div className="mainRectangle"></div>
            <div className="header"></div>
            <div className="triangle"><span>VS</span></div>
            <div className={`redRectangle ${activeCircle?.status === "completed" ? 'completed' : activeCircle?.status === "inactive" ? 'inactive' : ''}`}>
                {`#${activeCircle?.opponentGame.number} ${activeCircle?.opponentGame.name}: ${activeCircle?.opponentGame.total_points} pts`}
            </div>
            <div className="sectorInfo">{`Sector ${activeCircle?.playerGame.sector}R`}</div>
            <div
                className={`bottomRectangle ${activeCircle?.status === "inactive" || activeCircle?.status === "completed" ? 'inactive' : `state-${activeCircle?.playerGame.approveState}`}`}
                onClick={updateApproveState}
            >
                {activeCircle?.status === "completed" ? `+ ${activeCircle?.playerGame.points} Pts` : activeCircle?.status === "inactive" ? 'Approve' : activeCircle?.playerGame.approveState === 1 ? 'Approve' : activeCircle.playerGame.approveState === 2 ? 'Disapprove' : activeCircle.playerGame.approveState === 3 ? 'Approve' : 'Disapprove'}
            </div>
            <div className="playerNameContainer">
                <div className="playerName">{`#${activeCircle?.playerGame.number} ${activeCircle?.playerGame.name}: ${activeCircle?.playerGame.total_points} pts`}</div>
                <img src={vectorImage} alt='' className="vectorImage" onClick={navigateToTournament} />
            </div>
            <div className="circleContainerlayout">
                <div className="thickerWhiteLine"></div>
                <div className="circleContainer">
                    {userData.circles.map((circle) => (
                        <div
                            key={circle.number}
                            className={`circle ${circle.status} ${
                                activeCircle?.number === circle.number ? 'highlighted' : ''
                            }`}
                            onClick={() => handleCircleClick(circle)}
                        >
                            <span>{circle.index_circle}</span>
                            <span>
                                {circle.playerGame.fishCount}:{circle.opponentGame.fishCount}
                            </span>
                            {activeCircle?.number === circle.number && (
                                <div className="triangle-under-circle"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="whiteRectangleLeft">
                <div className="playerNumberLeft">{`#${activeCircle?.playerGame.number}`}</div>
            </div>
            <div className={`blueRectangleLeft ${activeCircle?.status === "completed" ? 'completed' : activeCircle?.status === "inactive" ? 'inactive' : 'active'}`}>
                {activeCircle?.status === "completed" || activeCircle?.status === "inactive" ? (
                    <div className="score">{activeCircle?.playerGame.fishCount}</div>
                ) : (activeCircle?.playerGame.approveState === 1 || activeCircle?.playerGame.approveState === 2) ? (
                    <input
                        type="tel"
                        value={playerScoreInput}
                        onFocus={() => setPlayerScoreInput('')}
                        onChange={handleScoreInputChange}
                        onBlur={handleScoreInputBlur}
                        className="scoreInput"
                    />
                ) : (
                    <input
                        type="tel"
                        value={playerScoreInput}
                        readOnly
                        className="scoreInput"
                    />
                )
            }
            </div>
            <div className="whiteRectangleRight">
                <div className="playerNumberRight">{`#${activeCircle?.opponentGame.number}`}</div>
            </div>
            <div className={`blueRectangleRight ${activeCircle?.status === "completed" ? 'completed' : activeCircle?.status === "inactive" ? 'inactive' : ''}`}>
    <div className="score">
        {activeCircle?.opponentGame.fishCount}
    </div>
</div>
        </article>
    );
};

export default Tournament;