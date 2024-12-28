package ro.tuc.ds2020;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class MyWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new HashSet<>();

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
        } else {

            broadcastMessage(session, payload);
        }
    }

    private void broadcastMessage(WebSocketSession sender, String message) throws IOException {
        for (WebSocketSession session : sessions) {
            if (session != sender && session.isOpen()) {
                session.sendMessage(new TextMessage("Message: " + message));
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
        System.out.println("Connection closed: " + session.getId());
    }
}
