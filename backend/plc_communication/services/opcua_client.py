"""OPC UA client for CP 443-1 OPC UA Server communication"""
import logging
from typing import Any, Optional, Dict, Callable
import asyncio
from threading import Thread, Event
from .base import BasePLCClient, PLCConnectionType, ConnectionStatus

logger = logging.getLogger(__name__)


class OpcUaClient(BasePLCClient):
    """
    OPC UA client for communication with CP 443-1 OPC UA server
    The CP 443-1 can function as OPC UA server (up to 10 concurrent sessions) [citation:9]
    """

    def __init__(self, name: str, endpoint_url: str, username: str = None, password: str = None):
        """
        Initialize OPC UA client

        Args:
            name: Client identifier
            endpoint_url: OPC UA server URL (e.g., "opc.tcp://192.168.0.1:4840")
            username: Optional username for authentication
            password: Optional password for authentication
        """
        super().__init__(name, PLCConnectionType.CP_OPCUA_SERVER)
        self.endpoint_url = endpoint_url
        self.username = username
        self.password = password
        self._client = None
        self._loop = None
        self._thread = None
        self._stop_event = Event()
        self._connected_nodes = {}

        # Parse URL to extract IP for display
        self.ip_address = endpoint_url.replace("opc.tcp://", "").split(":")[0]

    def _run_async(self, coro):
        """Run async coroutine in dedicated thread"""
        if self._loop is None or self._loop.is_closed():
            self._start_event_loop()

        future = asyncio.run_coroutine_threadsafe(coro, self._loop)
        return future.result(timeout=10)

    def _start_event_loop(self):
        """Start async event loop in background thread"""

        def run_loop():
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)
            self._loop.run_forever()

        self._thread = Thread(target=run_loop, daemon=True)
        self._thread.start()

        # Wait for loop to start
        while self._loop is None or not self._loop.is_running():
            import time
            time.sleep(0.1)

    def connect(self) -> bool:
        """Connect to CP 443-1 OPC UA server"""
        if self.status == ConnectionStatus.CONNECTED:
            return True

        self.status = ConnectionStatus.CONNECTING
        self._error_message = None

        try:
            from asyncua import Client

            self._client = Client(url=self.endpoint_url)

            # Set credentials if provided
            if self.username and self.password:
                self._client.set_user(self.username)
                self._client.set_password(self.password)

            # Connect
            self._run_async(self._client.connect())
            self.status = ConnectionStatus.CONNECTED
            logger.info(f"OPC UA connected to {self.endpoint_url}")
            self._notify('connected')
            return True

        except ImportError:
            self.status = ConnectionStatus.ERROR
            self._error_message = "asyncua library not installed. Run: pip install asyncua"
            logger.error(self._error_message)
            return False

        except Exception as e:
            self.status = ConnectionStatus.ERROR
            self._error_message = str(e)
            logger.error(f"OPC UA connection failed: {e}")
            return False

    def disconnect(self) -> bool:
        """Disconnect from OPC UA server"""
        try:
            if self._client:
                self._run_async(self._client.disconnect())
                self._client = None
            self.status = ConnectionStatus.DISCONNECTED
            logger.info("OPC UA disconnected")
            self._notify('disconnected')
            return True
        except Exception as e:
            logger.error(f"Disconnect error: {e}")
            return False
        finally:
            if self._loop:
                self._loop.call_soon_threadsafe(self._loop.stop)
                self._loop = None

    def _ensure_connected(self) -> bool:
        """Ensure connection exists"""
        if self.status != ConnectionStatus.CONNECTED:
            return self.connect()
        return True

    def get_node(self, node_id: str):
        """Get OPC UA node by ID"""
        if not self._ensure_connected():
            return None

        try:
            return self._client.get_node(node_id)
        except Exception as e:
            logger.error(f"Failed to get node {node_id}: {e}")
            return None

    def read_node(self, node_id: str) -> Optional[Any]:
        """Read value from OPC UA node"""
        if not self._ensure_connected():
            return None

        try:
            node = self.get_node(node_id)
            if node:
                value = self._run_async(node.read_value())
                logger.debug(f"Read {node_id}: {value}")
                return value
        except Exception as e:
            logger.error(f"Failed to read node {node_id}: {e}")
        return None

    def write_node(self, node_id: str, value: Any) -> bool:
        """Write value to OPC UA node"""
        if not self._ensure_connected():
            return False

        try:
            node = self.get_node(node_id)
            if node:
                self._run_async(node.write_value(value))
                logger.info(f"Written {node_id} = {value}")
                return True
        except Exception as e:
            logger.error(f"Failed to write node {node_id}: {e}")
        return False

    def read_value(self, address: str, **kwargs) -> Optional[Any]:
        """
        Read value from OPC UA node
        Address format: "ns=3;s=PLC_Tag_Name"
        """
        return self.read_node(address)

    def write_value(self, address: str, value: Any, **kwargs) -> bool:
        """Write value to OPC UA node"""
        return self.write_node(address, value)

    def browse_nodes(self, node_id: str = "Root") -> list:
        """Browse child nodes for discovery"""
        if not self._ensure_connected():
            return []

        try:
            node = self.get_node(node_id)
            if node:
                children = self._run_async(node.get_children())
                result = []
                for child in children[:50]:  # Limit for performance
                    result.append({
                        'node_id': str(child.nodeid),
                        'name': self._run_async(child.read_display_name()).Text,
                        'value': self._run_async(child.read_value()) if hasattr(child, 'read_value') else None
                    })
                return result
        except Exception as e:
            logger.error(f"Failed to browse nodes: {e}")
        return []

    def get_server_info(self) -> Optional[Dict]:
        """Get OPC UA server information"""
        if not self._ensure_connected():
            return None

        try:
            server_node = self.get_node("Server")
            if server_node:
                return {
                    'server_uri': self.endpoint_url,
                    'connected': True,
                    'server_status': self._run_async(server_node.get_value()) if hasattr(server_node,
                                                                                         'get_value') else "Unknown"
                }
        except Exception as e:
            logger.error(f"Failed to get server info: {e}")
        return None