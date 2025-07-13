#!/usr/bin/env python3
"""
Simple WebSocket test script to verify the backend WebSocket is working
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/chat/testroom/"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Send a test message
            test_message = {
                "message": "Hello from test script",
                "username": "testuser"
            }
            await websocket.send(json.dumps(test_message))
            print(f"Sent message: {test_message}")
            
            # Wait for response
            response = await websocket.recv()
            print(f"Received: {response}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket()) 