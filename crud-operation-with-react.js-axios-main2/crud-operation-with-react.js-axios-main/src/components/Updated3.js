import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function Update3() {
  const [deviceId, setDeviceId] = useState(null); 
  const [clientId, setClientId] = useState(''); 
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hourly, setHourly] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem('token'); 
        navigate('/'); 
      } else if (decoded.role !== 'admin') {
        navigate('/'); 
      }
    } catch (error) {
      console.error('Error decoding token:', error.message);
      localStorage.removeItem('token');
      navigate('/'); 
    }

    setDeviceId(localStorage.getItem('ID')); 
    setClientId(localStorage.getItem('PersonID')); 
    setDescription(localStorage.getItem('Description'));
    setAddress(localStorage.getItem('Address'));
    setHourly(localStorage.getItem('Hourly'));
  }, [navigate]);

  const updateAPIData = () => {
    const token = localStorage.getItem('token');

    axios.put(
      `/device/person/update/${clientId}/${deviceId}`,
      {
        description,
        address,
        hourly,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        navigate('/read3');
      })
      .catch((error) => {
        console.error('Error updating data:', error);
        alert('Failed to update data. Please try again.'); 
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
          <label>Device ID</label>
          <input placeholder='Device ID' value={deviceId} disabled />
        </Form.Field>
        <Form.Field>
          <label>Client ID</label>
          <input
            placeholder='Client ID'
            value={clientId}
            onChange={(e) => setClientId(e.target.value)} 
          />
        </Form.Field>
        <Form.Field>
          <label>Description</label>
          <input
            placeholder='Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Address</label>
          <input
            placeholder='Address'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
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
