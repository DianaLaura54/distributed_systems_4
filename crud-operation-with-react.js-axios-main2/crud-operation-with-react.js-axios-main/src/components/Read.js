import React, { useEffect, useState } from 'react';
import { Button, Table, Input } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

export default function Read() {
  const [APIData, setAPIData] = useState([]);
  const [userID, setUserID] = useState('');
  const [userData, setUserData] = useState(null);
  
  const API_URL = '/person';
  const DELETE_URL = '/device/person/delete';
  
  const navigate = useNavigate();


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

      return decoded; 
    } catch (error) {
      console.error('Error decoding token:', error.message);
      localStorage.removeItem('token');
      return false;
    }
  };

 
  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (!token || !verifyToken(token)) {
  
      navigate('/'); 
    } else {
      getData(); 
    }
  }, [navigate]);


  const getData = () => {
    const token = localStorage.getItem('token'); 

    if (!verifyToken(token)) {
      return; 
    }

    console.log('Fetching user data...');

    axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    })
    .then((response) => {
      console.log('Fetched data:', response.data);
      setAPIData(response.data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  };

  
  const getUserById = () => {
    if (userID) {
      const token = localStorage.getItem('token'); 

      if (!verifyToken(token)) {
        return; 
      }

      axios.get(`${API_URL}/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        }
      })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user by ID:', error);
      });
    }
  };

  
  const setData = (data) => {
    let { id, name, role, password } = data;
    localStorage.setItem('ID', id);
    localStorage.setItem('Name', name);
    localStorage.setItem('Role', role);
    localStorage.setItem('Password', password);
  };

 
  const onDelete = (id) => {
    const token = localStorage.getItem('token'); 

    if (!verifyToken(token)) {
      return;
    }

    console.log(`Attempting to delete user with ID: ${id}`);

    axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    })
    .then((response) => {
      console.log('User deleted successfully:', response.data);
      return axios.delete(`${DELETE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    })
    .then((response) => {
      console.log('Associated devices deleted successfully:', response.data);
      setAPIData([]); 
      getData(); 
    })
    .catch((error) => {
      console.error('Error deleting data:', error);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Input
          placeholder="Enter User ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
        />
        <Button onClick={getUserById}>Get User by ID</Button>
      </div>

      {userData && (
        <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Password</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{userData.id}</Table.Cell>
              <Table.Cell>{userData.name}</Table.Cell>
              <Table.Cell>{userData.role}</Table.Cell>
              <Table.Cell>{userData.password}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )}

      <h3>All Users</h3>
      <Table singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Password</Table.HeaderCell>
            <Table.HeaderCell>Update</Table.HeaderCell>
            <Table.HeaderCell>Delete</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {APIData.map((data) => (
            <Table.Row key={data.id}>
              <Table.Cell>{data.id}</Table.Cell>
              <Table.Cell>{data.name}</Table.Cell>
              <Table.Cell>{data.role}</Table.Cell>
              <Table.Cell>{data.password}</Table.Cell>
              <Table.Cell>
                <Link to='/update'>
                  <Button onClick={() => setData(data)}>Update</Button>
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Button onClick={() => onDelete(data.id)}>Delete</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
