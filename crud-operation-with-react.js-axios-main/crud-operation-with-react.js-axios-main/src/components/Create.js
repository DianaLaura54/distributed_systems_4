import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message, Segment } from 'semantic-ui-react';
import axios from 'axios';

const Create = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is user
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate input fields
    if (!username || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/person/signup', {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        role: [role], // Send role as an array
      });

      // Store the username in localStorage
      
      
      setSuccessMessage(response.data.message);

      // Redirect to WebSocketChatBox with username
      setTimeout(() => navigate('/Home.js'), 2000);
    } catch (error) {
      let errMsg = 'Account creation failed. Please try again.';
      if (error.response && error.response.data?.message) {
        errMsg = error.response.data.message;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-container">
      <Segment padded>
        <h2>Create Account</h2>
        <Form onSubmit={handleCreate}>
          {errorMessage && <Message negative>{errorMessage}</Message>}
          {successMessage && <Message positive>{successMessage}</Message>}
          <Form.Field>
            <label>Username</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                backgroundColor: username ? '#333' : '',
                color: username ? '#fff' : '',
                borderColor: username ? '#444' : '',
                transition: 'all 0.3s ease',
              }}
            />
          </Form.Field>
          <Form.Field>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                backgroundColor: email ? '#333' : '',
                color: email ? '#fff' : '',
                borderColor: email ? '#444' : '',
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
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: password ? '#333' : '',
                color: password ? '#fff' : '',
                borderColor: password ? '#444' : '',
                transition: 'all 0.3s ease',
              }}
            />
          </Form.Field>
          <Form.Field>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                backgroundColor: '#333',
                color: '#fff',
                borderColor: '#444',
                padding: '10px',
                borderRadius: '5px',
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Form.Field>
          <Button
            type="submit"
            primary
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create'}
          </Button>
        </Form>
      </Segment>
    </div>
  );
};  

export default Create; 