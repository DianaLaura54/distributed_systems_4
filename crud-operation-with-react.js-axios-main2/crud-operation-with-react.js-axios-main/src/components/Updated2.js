import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';  // Importing jwt-decode to decode the JWT

export default function Update2() {
  const [id, setID] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hourly, setHourly] = useState('');
  const [progress, setProgress] = useState(0);
  const history = useNavigate();

  // Function to verify the token and check if the user is admin
  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token); // Decode the token
      const currentTime = Date.now() / 1000; // Get current time in seconds

      // Check if token is expired
      if (decoded.exp < currentTime) {
        console.error('Token has expired');
        localStorage.removeItem('token'); // Remove expired token
        return false; // Expired token
      }

      // Check if the user role is admin
      if (decoded.role !== 'admin') {
        console.error('User is not an admin');
        return false; // Not an admin
      }

      return true; // Valid and admin token
    } catch (error) {
      console.error('Token decoding failed:', error.message);
      localStorage.removeItem('token'); // Remove invalid token
      return false; // Invalid token
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token || !verifyToken(token)) {
      history('/');  // Redirect to the login page if token is invalid or expired
    } else {
      // If token is valid and the user is an admin, set initial form values
      setID(localStorage.getItem('ID'));
      setDescription(localStorage.getItem('Description'));
      setAddress(localStorage.getItem('Address'));
      setHourly(localStorage.getItem('Hourly'));
    }
  }, [history]);

  const updateAPIData = () => {
    const token = localStorage.getItem('token'); // Retrieve token again for the request

    // Set up the authorization header with the token
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Make the PUT request with the Authorization header
    axios.put(`/device/${id}`, { 
      description,
      address,
      hourly 
    }, { headers })
    .then(() => {
      history('/read2'); // Redirect to the read2 page after successful update
    })
    .catch((error) => {
      console.error('Error updating data:', error);
    });
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); 
    setProgress(100); 
    updateAPIData(); 
  };

  return (
    <div>
      <LoadingBar
        color='#f11946'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Form className="update-form" onSubmit={handleButtonClick}>
        <Form.Field>
          <label>ID</label>
          <input placeholder='ID' value={id} disabled />
        </Form.Field>
        <Form.Field>
          <label>Description</label>
          <input placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Address</label>
          <input placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Hourly Rate</label>
          <input
            type='number' 
            placeholder='Hourly Rate'
            value={hourly}
            onChange={(e) => setHourly(e.target.value)}
          />
        </Form.Field>
        <Button type='submit'>Update</Button>
      </Form>
    </div>
  );
}
