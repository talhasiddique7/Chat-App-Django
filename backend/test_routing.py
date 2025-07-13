#!/usr/bin/env python3
"""
Test script to verify routing configuration
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatproject.settings')
django.setup()

from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from chatproject.asgi import application
import asyncio

async def test_routing():
    communicator = WebsocketCommunicator(
        application=application,
        path="/ws/chat/testroom/"
    )
    
    connected, _ = await communicator.connect()
    print(f"Connected: {connected}")
    
    if connected:
        await communicator.disconnect()

if __name__ == "__main__":
    asyncio.run(test_routing()) 