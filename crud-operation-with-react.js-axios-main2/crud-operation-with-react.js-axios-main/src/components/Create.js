import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message, Dropdown } from 'semantic-ui-react';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

export default function Create() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // UseEffect to check if the user is logged in and has admin privileges
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to access this page.');
      navigate('/'); // Redirect to login if no token
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if the token is expired
      if (decoded.exp < currentTime) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/'); // Redirect to login if token expired
        return;
      }

      // Check if the user has admin role
      if (!decoded || decoded.role.toLowerCase() !== 'admin') {
        setError('Access restricted: Admin role required.');
        navigate('/'); // Redirect if user is not an admin
        return;
      }
    } catch (error) {
      console.error('Error decoding token:', error.message);
      setError('Invalid session. Please log in again.');
      localStorage.removeItem('token');
      navigate('/'); // Redirect on token error
    }
  }, [navigate]);

  // Function to validate fields
  const validateFields = () => {
    if (!name || !role || !password) {
      setError('Please fill in all fields.');
      setProgress(0);
      return false;
    }
    return true;
  };

  // Function to post the data to the backend
  const postData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to perform this action.');
      navigate('/');
      return;
    }

    try {
      const response = await axios.post('/person/add2', 
        {
          name,
          role,
          password,
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the request header
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const personId = response.data;

        if (personId) {
          localStorage.setItem('user', JSON.stringify({ id: personId, name, role }));
          window.idUser = personId;

          setSuccess(true);
          setError('');
          try {
            // Second API call for device authorization
            const secondResponse = await axios.post(`/device/${window.idUser}`, {
              personId, 
              name,
              role,
            }, {
              headers: {
                Authorization: `Bearer ${token}`, // Send the token in the request header
              },
            });

            if (secondResponse.status !== 200) {
              console.warn("Second API call failed with status:", secondResponse.status);
            }
          } catch (secondError) {
            console.error("Error in second API call:", secondError);
            setError("User created, but there was an error with the second operation.");
          }
        } else {
          setError('Failed to retrieve user ID from the server.');
        }
      }
    } catch (error) {
      console.error('Error posting data:', error);
      if (error.response) {
        if (error.response.status === 409) {
          setError('Username already exists. Please choose a different name.');
        } else {
          setError(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
        }
      } else {
        setError('Failed to create user. Please check your network connection or try again.');
      }
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    setProgress(50);
    setError('');
    setSuccess(false);

    if (validateFields()) {
      postData();
    }
  };

  const roleOptions = [
    { key: 'admin', text: 'Admin', value: 'admin' },
    { key: 'user', text: 'User', value: 'user' },
  ];

  useEffect(() => {
    if (success) {
      const redirectTo = role === 'user' ? '/DevicePersonPage' : '/choice';
      navigate(redirectTo);
    }
  }, [success, role, navigate]);

  return (
    <div>
      <LoadingBar
        color='#f11946'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {error && <Message negative>{error}</Message>}
      {success && <Message positive>User created successfully!</Message>}
      <Form className="create-form" onSubmit={handleButtonClick}>
        <Form.Field>
          <label>Name</label>
          <input
            placeholder='Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Field>
        <Form.Field>
          <label>Role</label>
          <Dropdown
            placeholder='Select Role'
            fluid
            selection
            options={roleOptions}
            value={role}
            onChange={(e, { value }) => setRole(value)}
            required
          />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Field>
        <Button type='submit'>
          Submit
        </Button>
      </Form>
    </div>
  );
}
