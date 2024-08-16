import React from 'react';
import './Statelement.css';
import { useNavigate } from 'react-router-dom';

const Statelement = ({ leftBoxText, textName, textPts, textF, state, showCircle, circleColor, activeCircle, code }) => {
    const navigate = useNavigate();

  const handleCircleClick = () => {
    if (activeCircle !== undefined && activeCircle !== -1) {
      navigate(`/tournament/${code}`, { state: { activeCircle } });
    } else {
      navigate(`/tournament/${code}`);
    }
  };
  const getStateClass = (state) => {
    switch (state) {
      case 'completed':
        return 'completed';
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      default:
        return '';
    }
  };

  return (
    <div className={`rectangle1 ${getStateClass(state)}`}>
      <div className={`left-box1 ${getStateClass(state)}`}>
        <span className="number1">{leftBoxText}</span>
      </div>
      <div className="text-container">
        <div className="text1 text1-name">{`#${textName}`}</div>
        <div className="text1 text1-pts">{`${textPts}pts`}</div>
        <div className="text1 text1-f">{`${textF}f`}</div>
      </div>
      {showCircle ? (
        <div className="circle1" style={{ backgroundColor: circleColor }} onClick={handleCircleClick}>
          <div className="triangle1"></div>
        </div>
      ) : (
        <div className="circle-placeholder"></div>
      )}
    </div>
  );
};

export default Statelement;
