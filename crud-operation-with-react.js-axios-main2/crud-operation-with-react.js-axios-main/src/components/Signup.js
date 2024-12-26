import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

function SignUp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        setError('Token has expired. Please log in again.');
        localStorage.removeItem('token');
        return false;
      }

      return decoded; 
    } catch (error) {
      setError('Token verification failed. Please try again.');
      localStorage.removeItem('token');
      return false;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (name === '' || password === '' || role === '') {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('/person/add', { name, password, role });

      const token = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);

      const decodedToken = verifyToken(token);
      if (!decodedToken) return;

      const { id, role: userRole } = decodedToken;
      window.idUser = id;

      if (userRole.toLowerCase() === 'admin') {
        navigate('/choice');
      } else if (userRole.toLowerCase() === 'user') {
        navigate('/WebSocketChatBox');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('Username is already taken. Please choose another one.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <Form onSubmit={handleSignUp}>
        {error && <Message negative>{error}</Message>}
        <Form.Field>
          <label>Name</label>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Role</label>
          <input
            placeholder="Enter your role (e.g., admin, user)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </Form.Field>
        <Button type="submit" primary>
          Sign Up
        </Button>
      </Form>
    </div>
  );
}

export default SignUp;
