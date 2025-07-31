import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';

function Home() {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('general');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && roomName.trim()) {
      try {
        // Create or get the user before joining the room
        await axios.post('/api/users/', { username: username.trim() });
        navigate(`/chat/${roomName.trim()}`, { state: { username: username.trim() } });
      } catch (error) {
        console.error('Error creating user:', error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Join Chat</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="username" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="roomName" className="mb-3">
              <Form.Label>Room Name</Form.Label>
              <Form.Control
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </Form.Group>
            <Button disabled={!username.trim() || !roomName.trim()} className="w-100" type="submit">
              Join
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Home;
