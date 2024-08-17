import GroupImage from './images/Group.png';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Statelement from './Component/Statelement';
import './Statistics.css';

const server_url = "https://paladiandrew-hardtackle-server-638d.twc1.net:8443";


const Statistics = () => {
    const elements1 = [
        { leftBoxText: "?", textName: "...........Loading...........", textPts: "", textF: "", state: "active", showCircle: false, circleColor: "#32404D" },
        { leftBoxText: "?", textName: "...........please, wait...........", textPts: "", textF: "", state: "active", showCircle: false, circleColor: "#32404D" },
      ];
  const { code } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [countStages, setcountStages] = useState(0);
  const [elements, setElements] = useState(elements1)
  const navigateToTournament = () => {
    navigate(`/tournament/${code}`);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${server_url}/api/users`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const elements = data
            .filter((user) => user.user_name!== "Empty")
            .map((user, index) => ({
            leftBoxText: `${index + 1}`,
            textNumber: user.player_id,
            textName: `${user.player_id} ${user.user_name}`,
            textPts: user.total_user_points,
            textF: user.total_user_fish,
            state: "inactive",
            showCircle: false,
            circleColor: "32404D",
            activeCircle: -1,
            code: code,
        }));
          const { processedElements, matchedUser } = processElements(elements, data, code);
          setElements(processedElements);

      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchUsers();
  }, [code]);

  
  
  const processElements = (elements, users, code) => {
    elements.sort((a, b) => {
      if (b.textPts !== a.textPts) {
        return b.textPts - a.textPts;
      } else {
        return b.textF - a.textF; 
      }
    });
    const allStages = Math.min(...users.map((user) => user.circles.length));
    elements.slice(0, 4).forEach(element => {
      element.state = "completed";
    });
  
    const matchedUser = users.find(user => user.code === code);
    if (matchedUser) {
      matchedUser.circles.forEach(circle => {
        const index = elements.findIndex(element => element.textNumber === circle.opponentGame.number);
        if (circle.status === "active"){
            setStage(circle.number);
        }
  
        if (index !== -1) {
          elements[index].showCircle = true;
  
          if (circle.status === "completed") {
            elements[index].circleColor = "#32404D";
          } else if (circle.status === "inactive") {
            elements[index].circleColor = "#CCCCCC";
          } else if (circle.status === "active") {
            elements[index].circleColor = "#EA5558";
          }
          if(circle.second_circle === false) {
            elements[index].activeCircle = circle.number;
          }
        }
      });
    }
    if (stage === 0) setStage(allStages);
    setcountStages(allStages);
    const index = elements.findIndex(element => element.textNumber === matchedUser.player_id);
    elements[index].state = "active";
  
    return {
      processedElements: elements,
      matchedUser: matchedUser
    };
  };


  return (
    <div className='bg'>
      <div className='topbar'>
        <img src={GroupImage} alt='' className="groupImage" onClick={navigateToTournament} />
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
