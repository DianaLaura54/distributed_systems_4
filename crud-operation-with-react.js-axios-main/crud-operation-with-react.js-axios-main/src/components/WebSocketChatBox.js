import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed

const WebSocketChatBox = () => {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "User";

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !verifyToken(token)) {
            navigate("/login");
            return;
        }

        const userFlag = `chatPageOpen_${username}`;
        if (sessionStorage.getItem(userFlag)) {
            alert("You already have this page open in another tab.");
            navigate("/WebSocketChatBox");
            return;
        }

        sessionStorage.setItem(userFlag, "true");

        const ws = new WebSocket("/ws");

        ws.onopen = () => {
            console.log("Connected to the WebSocket server");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            console.log("Message from server:", event.data);

            if (event.data === "TYPING") {
                setTypingUsers((prevUsers) => new Set(prevUsers.add("User")));
            } else if (event.data === "STOP_TYPING") {
                setTypingUsers((prevUsers) => {
                    const updatedUsers = new Set(prevUsers);
                    updatedUsers.delete("User");
                    return updatedUsers;
                });
            } else if (event.data.startsWith("Message:")) {
                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    event.data.substring(8),
                ]);
                setTypingUsers(new Set());
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
            sessionStorage.removeItem(userFlag);
        };
    }, [navigate, username]);

    const verifyToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return false;
        }
    };

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const formattedMessage = `${username}: ${message}`;
            socket.send(formattedMessage);
            setChatMessages((prevMessages) => [...prevMessages, formattedMessage]);
            setMessage("");
            setTypingUsers((prevUsers) => {
                const updatedUsers = new Set(prevUsers);
                updatedUsers.delete(username);
                return updatedUsers;
            });
            socket.send("STOP_TYPING");
        } else {
            console.error("WebSocket is not connected");
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
        const userFlag = `chatPageOpen_${username}`;
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        sessionStorage.removeItem(userFlag);
        window.location.href = "/login";
    };

    return (
        <div style={styles.chatContainer}>
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
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>
        </div>
    );
};

// Keep the styles object unchanged unless necessary
const styles = {
    chatContainer: {
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        maxWidth: "90vw",
        margin: "0 auto",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        position: "relative",
        height: "80vh",
        overflow: "hidden",
    },
    chatWindow: {
        flex: 1,
        overflowY: "scroll",
        marginBottom: "10px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        padding: "10px",
    },
    chatMessagesContainer: {
        display: "flex",
        flexDirection: "column",
    },
    chatMessage: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
    },
    chatAvatar: {
        backgroundColor: "#0084FF",
        color: "#fff",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10px",
    },
    chatText: {
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        padding: "10px",
        maxWidth: "80%",
        wordWrap: "break-word",
        color: "black",
    },
    typingNotification: {
        fontStyle: "italic",
        color: "black",
        textAlign: "center",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderTop: "1px solid #ddd",
        padding: "10px",
        borderRadius: "8px",
    },
    inputField: {
        width: "85%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "16px",
        marginRight: "10px",
    },
    sendButton: {
        padding: "10px 15px",
        backgroundColor: "#0084FF",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s",
        width: "15%",
    },
    logoutContainer: {
        marginTop: "10px",
        textAlign: "center",
    },
    logoutButton: {
        padding: "10px 15px",
        backgroundColor: "#FF4D4D",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s",
    },};

export default WebSocketChatBox;
