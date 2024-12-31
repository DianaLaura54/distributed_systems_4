
package ro.tuc.ds2020;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;

@Component
public class MyWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private final Map<String, Set<WebSocketSession>> seenTracker = Collections.synchronizedMap(new HashMap<>());
    private final Map<String, WebSocketSession> messageSenders = Collections.synchronizedMap(new HashMap<>());

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("New connection established: " + session.getId());
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        if (payload.equals("TYPING")) {
            broadcastTyping(session);
        } else if (payload.equals("STOP_TYPING")) {
            broadcastStopTyping(session);
        } else if (payload.startsWith("SEEN:")) {
            String messageId = payload.substring(5);
            markMessageSeen(messageId, session);
        } else {
            // Parse name and message
            int separatorIndex = payload.indexOf(":");
            if (separatorIndex > -1) {
                String name = payload.substring(0, separatorIndex).trim();
                String content = payload.substring(separatorIndex + 1).trim();
                String messageId = String.valueOf(System.currentTimeMillis());
                String formattedMessage = messageId + ":" + name + ": " + content;

                // Track and broadcast the message
                seenTracker.put(messageId, new HashSet<>());
                messageSenders.put(messageId, session); // Track the sender
                broadcastMessage(session, formattedMessage);
            }
        }
    }

    private void broadcastMessage(WebSocketSession sender, String message) throws IOException {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        }
    }

    private void markMessageSeen(String messageId, WebSocketSession viewer) throws IOException {
        // Check if the message exists in the tracker
        if (seenTracker.containsKey(messageId)) {
            // Get the original sender of the message
            WebSocketSession sender = messageSenders.get(messageId);

            // Prevent the sender from marking their own message as seen
            if (sender != null && sender.equals(viewer)) {
                return; // Do nothing if the viewer is the sender
            }

            // Add the viewer to the seenTracker
            seenTracker.get(messageId).add(viewer);

            // Notify the sender about the "SEEN" status
            if (sender != null && sender.isOpen()) {
                sender.sendMessage(new TextMessage("SEEN:" + messageId));
            }
        }
    }



    private void broadcastTyping(WebSocketSession sender) throws IOException {
        for (WebSocketSession session : sessions) {
            if (session != sender && session.isOpen()) {
                session.sendMessage(new TextMessage("TYPING"));
            }
        }
    }

    private void broadcastStopTyping(WebSocketSession sender) throws IOException {
        for (WebSocketSession session : sessions) {
            if (session != sender && session.isOpen()) {
                session.sendMessage(new TextMessage("STOP_TYPING"));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);

        // Remove the session from seenTracker and messageSenders
        messageSenders.entrySet().removeIf(entry -> entry.getValue().equals(session));
        for (Set<WebSocketSession> viewers : seenTracker.values()) {
            viewers.remove(session);
        }

        System.out.println("Connection closed: " + session.getId());
    }
}

