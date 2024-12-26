import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const WebSocketChatBox = () => {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

       
        if (!token || !verifyToken(token)) {
            navigate("/login");
            return;
        }

        const userFlag = `chatPageOpen_${token}`;

      
        if (sessionStorage.getItem(userFlag)) {
            setError("You already have this page open in another tab.");
            navigate("/");
            return;
        }

        
        sessionStorage.setItem(userFlag, "true");

      
        window.addEventListener("storage", handleStorageChange);

        const ws = new WebSocket("/ws");

        ws.onopen = () => {
            console.log("Connected to the WebSocket server");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            handleMessageFromServer(event.data);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setError("WebSocket connection error. Please try again later.");
        };

        return () => {
            
            ws.close();
            sessionStorage.removeItem(userFlag);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [navigate]);

    const verifyToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return false;
        }
    };

    const handleStorageChange = (event) => {
      
        if (event.key === `chatPageOpen_${localStorage.getItem("token")}` && event.newValue === null) {
            navigate("/login"); 
        }
    };

    const handleMessageFromServer = (data) => {
        if (data === "TYPING") {
            setTypingUsers((prevUsers) => new Set(prevUsers.add("User")));
        } else if (data === "STOP_TYPING") {
            setTypingUsers((prevUsers) => {
                const updatedUsers = new Set(prevUsers);
                updatedUsers.delete("User");
                return updatedUsers;
            });
        } else if (data.startsWith("Message:")) {
            setChatMessages((prevMessages) => [
                ...prevMessages,
                data.substring(8),
            ]);
            setTypingUsers(new Set());
        }
    };

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const formattedMessage = `${localStorage.getItem("name")}: ${message}`;
            socket.send(formattedMessage);
            setChatMessages((prevMessages) => [...prevMessages, formattedMessage]);
            setMessage("");
            setTypingUsers((prevUsers) => {
                const updatedUsers = new Set(prevUsers);
                updatedUsers.delete(localStorage.getItem("name"));
                return updatedUsers;
            });
            socket.send("STOP_TYPING");
        } else {
            console.error("WebSocket is not connected");
            setError("WebSocket is not connected. Please refresh the page.");
        }
    };

    const handleTyping = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send("TYPING");
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (value.trim() === "") {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send("STOP_TYPING");
            }
        } else {
            handleTyping();
        }
    };

    const handleLogout = () => {
        const token = localStorage.getItem("token");
        const userFlag = `chatPageOpen_${token}`;
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        sessionStorage.removeItem(userFlag);
        window.localStorage.setItem(userFlag, null); 
        navigate("/login");
    };

    const redirectToDevicePersonPage = () => {
        navigate("/DevicePersonPage");
    };

   
    const styles = {
        chatContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "#f1f1f1",
            height: "100vh",
        },
        error: {
            color: "red",
            marginBottom: "10px",
        },
        chatWindow: {
            width: "100%",
            height: "60%",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "20px",
            backgroundColor: "#fff",
            padding: "10px",
        },
        chatMessagesContainer: {
            maxHeight: "100%",
            overflowY: "scroll",
        },
        chatMessage: {
            display: "flex",
            marginBottom: "10px",
        },
        chatAvatar: {
            marginRight: "10px",
            fontSize: "20px",
        },
        chatText: {
            fontSize: "16px",
            color: "#333",
        },
        typingNotification: {
            fontSize: "14px",
            color: "#888",
        },
        inputContainer: {
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "20px",
        },
        inputField: {
            width: "80%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
        },
        sendButton: {
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
        },
        logoutContainer: {
            display: "flex",
            justifyContent: "center",
        },
        redirectButton: {
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
            marginRight: "10px",
        },
        logoutButton: {
            padding: "10px 15px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s",
        }
    };

    return (
        <div style={styles.chatContainer}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.chatWindow}>
                <div style={styles.chatMessagesContainer}>
                    {chatMessages.map((msg, index) => (
                        <div key={index} style={styles.chatMessage}>
                            <div style={styles.chatAvatar}>💬</div>
                            <div style={styles.chatText}>{msg}</div>
                        </div>
                    ))}
                    {[...typingUsers].map((user, index) => (
                        <div key={index} style={styles.typingNotification}>
                            {user} is typing...
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Type your message"
                    style={styles.inputField}
                />
                <button
                    onClick={sendMessage}
                    disabled={!message}
                    style={styles.sendButton}
                >
                    Send
                </button>
            </div>

            <div style={styles.logoutContainer}>
                <button onClick={redirectToDevicePersonPage} style={styles.redirectButton}>
                    Go to Device Person Page
                </button>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default WebSocketChatBox;
