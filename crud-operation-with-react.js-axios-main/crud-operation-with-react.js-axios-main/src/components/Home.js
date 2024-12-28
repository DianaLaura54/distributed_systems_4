// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Choices:</h1>
      <div className="button-group">
        <Button primary onClick={() => navigate('/create')}>Sign Up</Button>
        <Button secondary onClick={() => navigate('/login')}>Log In</Button>
        
      </div>
    </div>
  );
};

export default Home;