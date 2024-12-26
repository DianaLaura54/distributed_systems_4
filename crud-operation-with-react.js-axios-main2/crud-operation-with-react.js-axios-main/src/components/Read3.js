import React, { useEffect, useState } from 'react';
import { Button, Table, Input } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function Read3() {
    const [APIData, setAPIData] = useState([]); 
    const [userID, setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const [personsData, setPersonsData] = useState([]);
    const API_URL = '/device';
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

        getData();
        getPersonsData();
    }, [navigate]);

    const getData = () => {
        const token = localStorage.getItem('token');
        axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            console.log('Devices API Response:', response.data); 
            setAPIData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching devices data:', error);
        });
    };

    const getPersonsData = () => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/person`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            console.log('Persons API Response:', response.data);
            setPersonsData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching persons data:', error);
        });
    };

    const getUserById = () => {
        if (!userID) {
            console.log('User ID is required');
            return;
        }

        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/${userID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            setUserData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching user by ID:', error);
        });
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
        axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
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
                        <Table.HeaderCell>Person ID</Table.HeaderCell>
                        <Table.HeaderCell>Update</Table.HeaderCell>
                        <Table.HeaderCell>Delete</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {APIData.map((data, index) => {
                        const personId = personsData[index] ? personsData[index].id : 'N/A'; 
                        return (
                            <Table.Row key={data.id}>
                                <Table.Cell>{data.id}</Table.Cell>
                                <Table.Cell>{data.description}</Table.Cell>
                                <Table.Cell>{data.address}</Table.Cell>
                                <Table.Cell>{data.hourly}</Table.Cell>
                                <Table.Cell>{personId}</Table.Cell>
                                <Table.Cell>
                                    <Link to='/update3'>
                                        <Button onClick={() => setData(data)}>Update</Button>
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button onClick={() => onDelete(data.id)}>Delete</Button>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
}
