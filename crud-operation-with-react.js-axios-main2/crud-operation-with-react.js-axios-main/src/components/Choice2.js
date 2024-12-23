import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode to decode the token

const Choice2 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login'); // If token doesn't exist, redirect to login
      return;
    }

    try {
      // Decode the token to get user details
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role; // Extract role from the decoded token

      // Check if the role is 'admin'
      if (role !== 'admin') {
        navigate('/'); // If not admin, redirect to home page (or any page you want)
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login'); // Redirect to login if token decoding fails
    }
  }, [navigate]);

  return (
    <div className="choice-container">
      <h1>Choose an Option (users)</h1>
      <div className="button-group">
        <Button primary onClick={() => navigate('/create')}>Create</Button>
        <Button secondary onClick={() => navigate('/read')}>Read</Button>
      </div>
    </div>
  );
};

export default Choice2;
