import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import GroupImage from './images/Group.png';
import Statelement from './Component/Statelement';
import { io } from 'socket.io-client';
import './Statistics.css';

const server_url = process.env.REACT_APP_API_URL;

const Statistics = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [watch, setWatch] = useState(true);
  const [countStages, setCountStages] = useState(0);
  const elements1 = [
    { leftBoxText: "?", textName: "...........Loading...........", textPts: "", textF: "", state: "active", showCircle: false, circleColor: "#32404D" },
    { leftBoxText: "?", textName: "...........please, wait...........", textPts: "", textF: "", state: "active", showCircle: false, circleColor: "#32404D" },
  ]; 
  const [elements, setElements] = useState(elements1)
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(`${server_url}`, {
      transports: ['websocket', 'polling'],
      secure: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Подключено к WebSocket серверу");
    });

    socketRef.current.on('allUsersUpdated', handleAllUsersUpdated);
    socketRef.current.on('reconnect', handleReconnect);

    socketRef.current.on('disconnect', () => {
      console.log('Отключено от сервера');
    });

    // Изначально загружаем данные
    fetchUsers();

    return () => {
      socketRef.current.off('allUsersUpdated', handleAllUsersUpdated);
      socketRef.current.off('reconnect', handleReconnect);
      socketRef.current.disconnect();
    };
  }, [code]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${server_url}/api/users`);
      if (!response.ok) {
        throw new Error('Сетевая ошибка');
      }
      const data = await response.json();
      const elements = data
        .filter((user) => user.user_name !== "Empty")
        .map((user, index) => ({
          leftBoxText: `${index + 1}`,
          textNumber: user.player_id,
          textName: `${user.player_id}` `${user.user_name}`,
          textPts: user.total_user_points,
          textF: user.total_user_fish,
          state: "inactive",
          showCircle: false,
          circleColor: "#32404D",
          activeCircle: -1,
          code: code,
      }));
      
      const { processedElements, newStage, allStages, watch: newWatch } = processElements(elements, data, code);
      setElements(processedElements);
      setStage(newStage);
      setCountStages(allStages);
      setWatch(newWatch);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleAllUsersUpdated = (data) => {
    console.log('Получено событие allUsersUpdated');
    const elements = data
      .filter((user) => user.user_name !== "Empty")
      .map((user, index) => ({
        leftBoxText: `${index + 1}`,
        textNumber: user.player_id,
        textName: `${user.player_id}` `${user.user_name}`,
        textPts: user.total_user_points,
        textF: user.total_user_fish,
        state: "inactive",
        showCircle: false,
        circleColor: "#32404D",
        activeCircle: -1,
        code: code,
    }));

    const { processedElements, newStage, allStages, watch: newWatch } = processElements(elements, data, code);
    setElements(processedElements);
    setStage(newStage);
    setCountStages(allStages);
    setWatch(newWatch);
  };

  const handleReconnect = () => {
    console.log('Переподключено к серверу');
    fetchUsers();
  };

  const processElements = (elements, users, code) => {
    elements.sort((a, b) => {
      if (b.textPts !== a.textPts) {
        return b.textPts - a.textPts;
      } else {
        return b.textF - a.textF; 
      }
    });
    
    const allStages = Math.min(...users.map((user) => user.circles.length));
    let newStage = 0;
    if (users[0]) {
      let activeCircle1 = users[0].circles.find(circle => circle.status === 'active');
      if (activeCircle1) {
        newStage = activeCircle1.index_circle;
      } else {
        newStage = allStages;
      }
    }

    elements.slice(0, 4).forEach(element => {
      element.state = "completed";
    });

    let watch = true;
    const matchedUser = users.find(user => user.code === code);
    if (matchedUser) {
      for (let i = matchedUser.circles.length - 1; i >= 0; i--) {
        const circle = matchedUser.circles[i];
        const index = elements.findIndex(element => element.textNumber === circle.opponentGame.number);
        if (index !== -1) {
          elements[index].showCircle = true;

          if (circle.status === "completed") {
            elements[index].circleColor = "#32404D";
          } else if (circle.status === "inactive") {
            elements[index].circleColor = "#CCCCCC";
          } else if (circle.status === "active") {
            elements[index].circleColor = "#EA5558";
          }
          elements[index].activeCircle = circle.number;
        }
      }
      const index = elements.findIndex(element => element.textNumber === matchedUser.player_id);
      if(index !== -1) {
        elements[index].state = "active";
      }
    } else {
      watch = false;
    }

    elements.forEach((element, i) => {
      element.leftBoxText = i + 1;
    });
    
    return {
      processedElements: elements,
      matchedUser: matchedUser,
      newStage: newStage,
      allStages: allStages,
      watch: watch,
    };
  };

  const navigateToTournament = () => {
    navigate(`/tournament/${code}`);
  };


  return (
    <div className='bg'>
      <div className='topbar'>
      {watch && (
            <img
            src={GroupImage}
            alt=''
            className="groupImage"
            onClick={navigateToTournament}
            />
        )}
        <div className='title1'>{stage}/{countStages}</div>
      </div>
      <div className='content1'>
        {elements.map((element, index) => (
          <Statelement
            key={index}
            leftBoxText={element.leftBoxText}
            textName={element.textName}
            textPts={element.textPts}
            textF={element.textF}
            state={element.state}
            showCircle={element.showCircle}
            circleColor={element.circleColor}
            activeCircle={element.activeCircle}
            code = {code}
          />
        ))}
      </div>
    </div>
  );
};

export default Statistics;
