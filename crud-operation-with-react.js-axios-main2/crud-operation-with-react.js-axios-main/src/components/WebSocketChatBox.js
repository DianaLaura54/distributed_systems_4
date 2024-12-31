import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const WebSocketChatBox = () => {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const chatWindowRef = useRef(null); // Reference to chatWindow container

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !verifyToken(token)) {
            navigate("/login");
            return;
        }

        const ws = new WebSocket("/ws");

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
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
        };
    }, [navigate]);

    const verifyToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                localStorage.removeItem("token");
                return false;
            }
            return true;
        } catch {
            return false;
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
        } else if (data.startsWith("SEEN:")) {
            const messageId = data.substring(5);
            setChatMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === messageId ? { ...msg, seen: true } : msg
                )
            );
        } else {
            const [messageId, sender, ...content] = data.split(":");
            const text = content.join(":");
            setChatMessages((prevMessages) => [
                ...prevMessages,
                { id: messageId, sender, text, seen: false },
            ]);
            setTypingUsers(new Set());
        }
    };

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const name = localStorage.getItem("name");
            const formattedMessage = `${name}:${message}`;
            socket.send(formattedMessage);
            setMessage("");
            socket.send("STOP_TYPING");
        }
    };

    const markMessageAsSeen = (messageId, sender) => {
        const currentUser = localStorage.getItem("name");
        if (socket && socket.readyState === WebSocket.OPEN && sender !== currentUser) {
            socket.send(`SEEN:${messageId}`);
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

    const currentUser = localStorage.getItem("name");

    const styles = {
        chatContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "#f1f1f1",
            height: "80vh", // Ensure the container is full screen
            overflow: "hidden", // To prevent overflow from children
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
            color: "#333", // Explicitly set color to dark text
        },
        
        chatMessagesContainer: {
            maxHeight: "100%",
            overflowY: "scroll",
            position: "relative",
        },
        chatMessage: {
            display: "flex",
            marginBottom: "10px",
            position: "relative", // Ensure relative positioning for seen indicator
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
            gap: "10px", // Add some space between buttons
            marginTop: "10px", // Ensure there's space between chat and buttons
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
        },
        seenText: {
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#e0e0e0", // Light gray background for the seen text
            borderRadius: "12px",
            fontSize: "14px",
            color: "green",
            padding: "2px 8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            fontWeight: "bold",
        },
    };

    const handleMouseMove = (event) => {
        const chatWindowElement = chatWindowRef.current;
        const chatWindowWidth = chatWindowElement.offsetWidth;
        const mousePosition = event.clientX - chatWindowElement.getBoundingClientRect().left;
        const threshold = chatWindowWidth * 0.8; // 80% of the chat window width

        // If the mouse is over 80% of the chat window width, mark the message as seen
        if (mousePosition >= threshold) {
            chatMessages.forEach(msg => {
                if (!msg.seen) {
                    markMessageAsSeen(msg.id, msg.sender);
                }
            });
        }
    };

    return (
        <div style={styles.chatContainer}>
            {error && <div style={styles.error}>{error}</div>}

            <div 
                ref={chatWindowRef} 
                style={styles.chatWindow}
                onMouseMove={handleMouseMove} // Attach mouse move event to chat window
            >
                <div style={styles.chatMessagesContainer}>
                    {chatMessages.map((msg) => (
                        <div key={msg.id} style={styles.chatMessage}>
                            <strong>{msg.sender}: </strong>
                            <span>{msg.text}</span>
                            {msg.seen && (
                                <span style={styles.seenText}>
                                    (Seen)
                                </span>
                            )}
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
