import React, { useEffect, useState } from 'react';
import { Button, Table, Input } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function Read2() {
    const [APIData, setAPIData] = useState([]);
    const [userID, setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const API_URL = '/device';
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

            return true; 
        } catch (error) {
            console.error('Token decoding failed:', error.message);
            localStorage.removeItem('token');
            return false; 
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token'); 

        if (!token || !verifyToken(token)) {
            navigate('/');  
        } else {
            getData(token);  
        }
    }, [navigate]);

   
    const getData = (token) => {
        axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
            console.log('API Response:', response.data); 
            setAPIData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    };

    
    const getUserById = () => {
        const token = localStorage.getItem('token');
        if (userID && token) {
            axios.get(`${API_URL}/${userID}`, {
                headers: { Authorization: `Bearer ${token}` }
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
        const { id, description, address, hourly } = data; 
        localStorage.setItem('ID', id);
        localStorage.setItem('Description', description);
        localStorage.setItem('Address', address);
        localStorage.setItem('Hourly', hourly);
    };

    
    const onDelete = (id) => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                getData(token);  
            })
            .catch((error) => {
                console.error('Error deleting data:', error);
            });
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <Input
                    placeholder="Enter Device ID"
                    value={userID}
                    onChange={(e) => setUserID(e.target.value)}
                />
                <Button onClick={getUserById}>Get Device by ID</Button>
            </div>

            {userData && (
                <Table singleLine>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell>Address</Table.HeaderCell>
                            <Table.HeaderCell>Hourly Rate</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>{userData.id}</Table.Cell>
                            <Table.Cell>{userData.description}</Table.Cell>
                            <Table.Cell>{userData.address}</Table.Cell>
                            <Table.Cell>{userData.hourly}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            )}

            <h3>All Devices</h3>
            <Table singleLine>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                        <Table.HeaderCell>Hourly Rate</Table.HeaderCell>
                        <Table.HeaderCell>Update</Table.HeaderCell>
                        <Table.HeaderCell>Delete</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {APIData.map((data) => (
                        <Table.Row key={data.id}>
                            <Table.Cell>{data.id}</Table.Cell>
                            <Table.Cell>{data.description}</Table.Cell>
                            <Table.Cell>{data.address}</Table.Cell>
                            <Table.Cell>{data.hourly}</Table.Cell>
                            <Table.Cell>
                                <Link to='/update2'>
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
