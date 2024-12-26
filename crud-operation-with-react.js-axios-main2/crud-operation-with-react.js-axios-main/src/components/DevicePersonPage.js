import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 

const DevicePersonPage = () => {
    const [devices, setDevices] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [deviceId, setDeviceId] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const token = localStorage.getItem('token'); 

                if (!token) {
                    setErrorMessage('Token is missing. Please log in again.');
                    navigate('/login');
                    return;
                }

                const decodedToken = jwtDecode(token);
                const clientId = decodedToken.id; 

                if (!clientId) {
                    setErrorMessage('User ID is not available in token.');
                    return;
                }

                
                const response = await axios.get(`/device/person/${clientId}`);
                console.log('Fetched devices:', response.data);

                if (Array.isArray(response.data)) {
                    if (response.data.length === 0) {
                        setErrorMessage('No devices found for this Client ID.');
                    } else {
                        setDevices(response.data);
                        setErrorMessage('');
                    }
                } else if (typeof response.data === 'object' && response.data !== null) {
                    setErrorMessage(response.data.message || 'Unexpected response format.');
                } else {
                    setErrorMessage('No devices found for this Client ID.');
                }
            } catch (error) {
                console.error('Error fetching devices:', error);
                setDevices([]);
                if (error.response) {
                    setErrorMessage(error.response.data?.message || 'Error fetching devices. Please try again.');
                } else {
                    setErrorMessage('Error fetching devices. Please check your network connection or try again.');
                }
            }
        };

        fetchDevices();
    }, [navigate]);

    

    return (
        <div style={{ padding: '20px' }}>
            <h1>
                Devices Associated with Client ID:{' '}
                {localStorage.getItem('token') ? (
                    jwtDecode(localStorage.getItem('token')).id
                ) : (
                    'Not available'
                )}
            </h1>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

         

            {}
            {devices.length > 0 ? (
                <ul>
                    {devices.map((device) => (
                        <li key={device.id}>
                            <strong>Device ID:</strong> {device.id} <br />
                            <strong>Description:</strong> {device.description} <br />
                            <strong>Address:</strong> {device.address} <br />
                            <strong>Hourly Rate:</strong> {device.hourly} <br />
                        </li>
                    ))}
                </ul>
            ) : (
                devices.length === 0 && !errorMessage && <p>No devices found for this Client ID.</p>
            )}
        </div>
    );
};

export default DevicePersonPage;
