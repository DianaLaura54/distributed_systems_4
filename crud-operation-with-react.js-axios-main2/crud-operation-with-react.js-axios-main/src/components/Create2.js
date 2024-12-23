import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Correct import for jwt-decode

export default function Create2() {
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [hourly, setHourly] = useState('');
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
        if (!description || !address || !hourly) {
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

        const hourlyRate = parseInt(hourly, 10);

        try {
            setProgress(50);
            const response = await axios.post('/device', {
                description,
                address,
                hourly: hourlyRate,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                setError('');
                setTimeout(() => {
                    navigate('/read2');
                }, 1000);
            }
        } catch (error) {
            console.error('Error posting data:', error);
            if (error.response) {
                if (error.response.status === 409) {
                    setError('Conflict: Device already exists.');
                } else {
                    setError(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
                }
            } else {
                setError('Failed to create device. Please check your network connection or try again.');
            }
        }
    };

    // Handle form submission
    const handleButtonClick = (e) => {
        e.preventDefault();
        setProgress(0);
        setError('');
        setSuccess(false);

        if (validateFields()) {
            postData();
        }
    };

    return (
        <div>
            <LoadingBar
                color='#f11946'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            {error && <Message negative>{error}</Message>}
            {success && <Message positive>Device created successfully!</Message>}
            <Form className="create-form" onSubmit={handleButtonClick}>
                <Form.Field>
                    <label>Description</label>
                    <input
                        placeholder='Enter a brief description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Field>
                <Form.Field>
                    <label>Address</label>
                    <input
                        placeholder='Enter address'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </Form.Field>
                <Form.Field>
                    <label>Hourly Rate</label>
                    <input
                        type='number'
                        placeholder='Enter hourly rate'
                        value={hourly}
                        onChange={(e) => setHourly(e.target.value)}
                        required
                    />
                </Form.Field>
                <Button type='submit'>Submit</Button>
            </Form>
        </div>
    );
}
