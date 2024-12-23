import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message, Segment } from 'semantic-ui-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginFormInvalid, setLoginFormInvalid] = useState(true);
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setLoginFormInvalid(value.length < 3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    }
  };

  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.error('Token has expired');
        setErrorMessage('Token has expired. Please log in again.');
        localStorage.removeItem('token');
        return false;
      }

      console.log('Token is valid');
      return true;
    } catch (error) {
      console.error('Token decoding failed:', error.message);
      setErrorMessage('Token verification failed. Please log in again.');
      localStorage.removeItem('token');
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('/person/signin', {
        username: username.trim(),
        password: password.trim(),
      });

      const { accessToken, tokenType } = response.data;

      if (accessToken && tokenType) {
        const token = `${tokenType} ${accessToken}`;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);  // Store the username

        if (verifyToken(token)) {
          alert('Login successful!');
          navigate('/WebSocketChatBox'); // Redirect to WebSocketChatBox
        }
      } else {
        setErrorMessage('Token not received. Please try again.');
      }
    } catch (error) {
      let errMsg = 'Login failed. Please try again.';
      if (error.response && error.response.data.message) {
        errMsg = error.response.data.message;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="login-container">
      <Segment padded>
        <h2>Login</h2>
        <Form onSubmit={handleLogin}>
          {errorMessage && <Message negative>{errorMessage}</Message>}
          <Form.Field>
            <label>Username</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
              name="username"
              required
              style={{
                backgroundColor: username ? '#333' : '',
                color: username ? '#fff' : '',  // Ensures text is white while typing
                borderColor: username ? '#444' : '',
                transition: 'all 0.3s ease',
              }}
            />
          </Form.Field>
          <Form.Field>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handleInputChange}
              name="password"
              required
              style={{
                backgroundColor: password ? '#333' : '',
                color: password ? '#fff' : '',  // Ensures text is white while typing
                borderColor: password ? '#444' : '',
                transition: 'all 0.3s ease',
              }}
            />
          </Form.Field>
          <Button
            type="submit"
            primary
            disabled={isLoading || loginFormInvalid}
            loading={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </Segment>
    </div>
  );
};

export default Login;
