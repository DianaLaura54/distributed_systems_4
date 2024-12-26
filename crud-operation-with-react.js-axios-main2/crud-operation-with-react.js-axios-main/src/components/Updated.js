import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function Update() {
  const [id, setID] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const history = useNavigate();

 
  const verifyToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.error('Token has expired');
        localStorage.removeItem('token');
        return false;
      }

      if (decoded.role !== 'admin') {
        console.error('User is not an admin');
        return false; 
      }

      return true; 
    } catch (error) {
      console.error('Error decoding token:', error.message);
      localStorage.removeItem('token');
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (!token || !verifyToken(token)) {
      history('/'); 
    } else {
    
      setID(localStorage.getItem('ID'));
      setName(localStorage.getItem('Name')); 
      setRole(localStorage.getItem('Role')); 
      setPassword(localStorage.getItem('Password')); 
    }
  }, [history]);

 
  const updateAPIData = () => {
    const token = localStorage.getItem('token'); 

    axios.put(`/person/${id}`, { 
      name,
      role,
      password,
    }, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    })
    .then(() => {
      history('/read'); 
    })
    .catch((error) => {
      console.error('Error updating data:', error);
    });
  };

 
  const handleButtonClick = () => {
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
      <Form className="update-form" onSubmit={(e) => e.preventDefault()}>
        <Form.Field>
          <label>ID</label>
          <input placeholder='ID' value={id} disabled />
        </Form.Field>
        <Form.Field>
          <label>Name</label>
          <input placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Role</label>
          <input placeholder='Role' value={role} onChange={(e) => setRole(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input
            type='password' 
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Field>
        <Button type='submit' onClick={handleButtonClick}>Update</Button>
      </Form>
    </div>
  );
}
