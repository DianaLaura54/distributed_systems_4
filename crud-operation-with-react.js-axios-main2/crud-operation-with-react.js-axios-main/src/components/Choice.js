import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Choice2 from './Choice2';    
import Choice3 from './Choice3';  
import Mapping from './Mapping';

const Choice = () => {
  const navigate = useNavigate();

  return (
    <div className="choice-container">
      <h1>Choose an Option</h1>
      <div className="button-group">
        <Button primary onClick={() => navigate('/choice2')}>Users</Button>
        <Button secondary onClick={() => navigate('/choice3')}>Devices</Button>
        <Button third onClick={() => navigate('/mapping')}>Map user to device</Button>
      </div>
    </div>
  );
};

export default Choice;