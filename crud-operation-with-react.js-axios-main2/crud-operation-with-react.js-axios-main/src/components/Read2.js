import React, { useEffect, useState } from 'react';
import { Button, Table, Input } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Corrected import

export default function Read2() {
    const [APIData, setAPIData] = useState([]);
    const [userID, setUserID] = useState('');
    const [userData, setUserData] = useState(null);
    const API_URL = '/device';
    const navigate = useNavigate();

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
            navigate('/');  // Redirect to the login page if token is invalid or expired
        } else {
            getData(token);  // If the token is valid and the user is an admin, fetch data
        }
    }, [navigate]);

    // Fetch data for all devices
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

    // Fetch device data by ID
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

    // Store data for updating the device
    const setData = (data) => {
        const { id, description, address, hourly } = data; 
        localStorage.setItem('ID', id);
        localStorage.setItem('Description', description);
        localStorage.setItem('Address', address);
        localStorage.setItem('Hourly', hourly);
    };

    // Delete a device
    const onDelete = (id) => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                getData(token);  // Refresh data after deletion
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
