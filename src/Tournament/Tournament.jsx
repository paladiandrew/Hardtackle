import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import vectorImage from './images/Vector.png';
import { io } from 'socket.io-client';
import './Tournament.css';

const server_url = process.env.REACT_APP_API_URL;

const Tournament = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousScoreInput, setPreviousScoreInput] = useState(null);
  const { state } = location;

  const [activeCircle, setActiveCircle] = useState(null);
  const [playerScoreInput, setPlayerScoreInput] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Используем useRef для хранения очереди несообщенных действий
  const unsentActionsQueueRef = useRef([]);

  // Создаем реф для сокета
  const socketRef = useRef(null);

  useEffect(() => {
    // Создаем соединение с сокетом только один раз при монтировании компонента
    socketRef.current = io(`${server_url}`, {
      transports: ['websocket', 'polling'],
      secure: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    return () => {
      // Отключаем сокет при размонтировании компонента
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${server_url}/api/user/${code}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUserData(data);
        if (
          state &&
          state.activeCircle &&
          data.circles.find((circle) => circle.number === state.activeCircle)
        ) {
          const newActiveCircle = data.circles.find(
            (circle) => circle.number === state.activeCircle
          );
          setActiveCircle(newActiveCircle);
          setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
        } else {
          const newActiveCircle = data.circles.find((circle) => circle.status === 'active');
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
    const socket = socketRef.current;

    // Обработчики событий сокета для обновления данных пользователя
    const handleUserUpdated = (data) => {
      const { updatedUserData, activeCircleNumber } = data;
      if (userData && userData.code === updatedUserData.code) {
        setUserData(updatedUserData);
        const updatedCircle = updatedUserData.circles.find((c) => c.number === activeCircleNumber);
        setActiveCircle(updatedCircle);
        setPlayerScoreInput(updatedCircle.playerGame.fishCount);
      } else if (userData) {
        const currUpdatedActiveCircle = updatedUserData.circles.find(
          (circle) =>
            circle.number === activeCircleNumber &&
            circle.opponentGame.number === userData.player_id &&
            circle.status === 'active'
        );
        let number = activeCircle?.number;
        if (currUpdatedActiveCircle) {
          const updatedCircles = userData.circles.map((circle) => {
            const updatedCircle = updatedUserData.circles.find(
              (c) =>
                c.status === 'active' &&
                c.opponentGame.number === circle.playerGame.number &&
                circle.opponentGame.number === c.playerGame.number &&
                circle.status === 'active'
            );
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
                },
              };
            }
            return circle;
          });
          setUserData((prevUserData) => ({
            ...prevUserData,
            circles: updatedCircles,
          }));
          const newActiveCircle = updatedCircles.find(
            (circle) =>
              circle.opponentGame.number === currUpdatedActiveCircle.playerGame.number &&
              circle.playerGame.number === currUpdatedActiveCircle.opponentGame.number &&
              circle.status === 'active'
          );
          setActiveCircle(newActiveCircle);
          setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
        }
      }
    };

    const handleAllUsersUpdated = (updatedUsersData) => {
      const currentUser = updatedUsersData.find((user) => user.code === code);
      if (currentUser) {
        setUserData(currentUser);
        let currUpdatedActiveCircle = currentUser.circles.find(
          (circle) => circle.status === 'active'
        );
        if (!currUpdatedActiveCircle) {
          currUpdatedActiveCircle = currentUser.circles.find((circle) => circle.number === 1);
        }
        setActiveCircle(currUpdatedActiveCircle);
        setPlayerScoreInput(currUpdatedActiveCircle.playerGame.fishcount);
        console.log(playerScoreInput);
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
    };

    const handleReconnect = () => {
      console.log('Reconnected to server');
      handleReconnection();
    };

    socket.on('allUsersUpdated', handleAllUsersUpdated);
    socket.on('userUpdated', handleUserUpdated);

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('allUsersUpdated', handleAllUsersUpdated);
      socket.off('userUpdated', handleUserUpdated);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
    };
  }, [userData, playerScoreInput, activeCircle, code]);

  // Функция обработки повторного подключения
  const handleReconnection = () => {
    resendUnsentActions();
    fetchLatestDataFromServer();
  };

  // Добавляем обработчики событий 'online' и 'offline'
  useEffect(() => {
    function handleOnline() {
      console.log('Интернет подключен');
      handleReconnection();
    }

    function handleOffline() {
      console.log('Интернет отключен');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (activeCircle) {
      setPlayerScoreInput(activeCircle.playerGame.fishCount);
      setPreviousScoreInput(activeCircle.playerGame.fishCount);
    }
  }, [activeCircle]);

  // Функция повторной отправки несообщенных действий
  const resendUnsentActions = async () => {
    while (unsentActionsQueueRef.current.length > 0) {
      const action = unsentActionsQueueRef.current.shift();
      await action();
    }
  };

  // Функция получения последних данных с сервера
  const fetchLatestDataFromServer = async () => {
    try {
      const response = await fetch(`${server_url}/api/user/${code}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        updateActiveCircle(data);
      } else {
        console.error('Failed to fetch latest data');
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  // Функция обновления активного круга
  const updateActiveCircle = (data) => {
    const newActiveCircle = data.circles.find((circle) => circle.status === 'active') || data.circles[0];
    setActiveCircle(newActiveCircle);
    setPlayerScoreInput(newActiveCircle.playerGame.fishCount);
  };

  const handleCircleClick = (circle) => {
    setActiveCircle(circle);
    if (circle.status === 'active') setPlayerScoreInput(circle.playerGame.fishCount);
  };

  const navigateToTournament = () => {
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    navigate(`/statistics/${code}`);
  };

  // Функция отправки данных на сервер с обработкой ошибок и очередью
  const sendDataToServer = async (action, data) => {
    try {
      let response;
      if (action === 'updateScore') {
        response = await fetch(`${server_url}/api/update-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else if (action === 'updateApproveState') {
        response = await fetch(`${server_url}/api/update-approve-state`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        console.log(`${action} успешно отправлено на сервер`);
      } else {
        throw new Error(`Сервер вернул ошибку при отправке ${action}`);
      }
    } catch (error) {
      console.error(`Ошибка при отправке ${action}:`, error);
      unsentActionsQueueRef.current.push(() => sendDataToServer(action, data));
    }
  };

  // Модифицированная функция обновления состояния подтверждения
  const updateApproveState = async () => {
    if (
      !activeCircle ||
      activeCircle.status !== 'active' ||
      !userData ||
      typeof activeCircle.playerGame.fishCount !== 'number' ||
      isNaN(activeCircle.playerGame.fishCount) ||
      typeof activeCircle.opponentGame.fishCount !== 'number' ||
      isNaN(activeCircle.opponentGame.fishCount)
    )
      return;

    // Обновляем локальные данные
    const activeCircleIndex = userData.circles.findIndex(
      (circle) => circle.number === activeCircle.number && circle.status === 'active'
    );
    if (activeCircleIndex !== -1) {
      let updatedUserData = { ...userData };
      // Подготавливаем данные для отправки
      const dataToSend = { userData: updatedUserData, activeCircleNumber: activeCircle.number };

      // Отправляем данные на сервер
      sendDataToServer('updateApproveState', dataToSend);
    }
  };

  // Модифицированная функция обработки изменения ввода очков
  const handleScoreInputChange = (e) => {
    let value = e.target.value;
    if (value === '' || isNaN(value) || parseInt(value) > 99) {
      value = 0;
    } else {
      value = parseInt(value);
    }
    setPlayerScoreInput(value);
  };

  const handleEnterButtonClick = () => {
    let newPlayerScoreInput;
    if (playerScoreInput === '' || isNaN(playerScoreInput)) {
      newPlayerScoreInput = 0;
    } else {
      newPlayerScoreInput = parseInt(playerScoreInput, 10);
    }

    if (newPlayerScoreInput !== previousScoreInput) {
      const activeCircleIndex = userData.circles.findIndex(
        (circle) => circle.number === activeCircle.number && circle.status === 'active'
      );
      if (activeCircleIndex !== -1) {
        let updatedUserData = { ...userData };
        updatedUserData.circles[activeCircleIndex].playerGame.fishCount = newPlayerScoreInput;
        setPlayerScoreInput(newPlayerScoreInput);
        setUserData(updatedUserData);
        setActiveCircle(updatedUserData.circles[activeCircleIndex]);

        // Подготовка данных для отправки
        const dataToSend = { userData: updatedUserData, activeCircleNumber: activeCircle.number };

        // Отправка данных на сервер
        sendDataToServer('updateScore', dataToSend);

        // Обновляем previousScoreInput
        setPreviousScoreInput(newPlayerScoreInput);
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
            <div className='kostul'></div>
            <div className='kostul2'></div>
            <div className='kostul3'></div>
            <div className="mainRectangle"></div>
            <div className="header"></div>
            <div className="triangle"><span>VS</span></div>
            <div className={`redRectangle ${activeCircle?.status === "completed" ? 'completed' : activeCircle?.status === "inactive" ? 'inactive' : ''}`}>
                {`#${activeCircle?.opponentGame.number} ${activeCircle?.opponentGame.name}: ${activeCircle?.opponentGame.total_points} pts`}
            </div>
            <div className="sectorInfo">
                {`Sector ${activeCircle?.playerGame.sector}${(activeCircle?.playerGame.number % 2 === activeCircle?.index_circle % 2) ? 'R' : 'L'}`}
            </div>
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
                    <>
                    <input
                      type="tel"
                      value={playerScoreInput}
                      onFocus={() => setPlayerScoreInput('')}
                      onChange={handleScoreInputChange}
                      className="scoreInputActive"
                    />
                    <button onClick={handleEnterButtonClick} className="enterButton">Enter</button>
                    </>
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