import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 
  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded); 
      const currentTime = Date.now() / 1000;
  
      if (decoded.exp < currentTime) {
        console.error('Token has expired');
        setError('Token has expired. Please log in again.');
        localStorage.removeItem('token');
        return false;
      }
  
      console.log('Token is valid');
      return decoded;
    } catch (error) {
      console.error('Token decoding failed:', error.message);
      setError('Token verification failed. Please log in again.');
      localStorage.removeItem('token');
      return false;
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (name === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }
  
    try {
      const response = await axios.post('/person/login', { name, password });
  
      console.log('Login API response:', response.data);
  
      const token = response.data;
      console.log('Token:', token);  
  
      localStorage.setItem('token', token);
      localStorage.setItem('name',name);
  
      const decodedToken = verifyToken(token);
      if (!decodedToken) return;
  
      console.log('Decoded Token:', decodedToken); 
  
      const { id, role } = decodedToken; 
      console.log('Extracted ID:', id);
      console.log('Extracted Role:', role);
  
      window.idUser = id;
  
      if (role.toLowerCase() === 'admin') {
        navigate('/choice');
      } else if (role.toLowerCase() === 'user') {
        console.log("user");
    
        navigate('/WebSocketChatBox');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred. Please try again.');
    }
  };
  
  


  return (
    <div className="login-container">
      <h2>Login</h2>
      <Form onSubmit={handleLogin}>
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
        <Button type="submit" primary>
          Login
        </Button>
      </Form>
    </div>
  );
}

export default Login;
