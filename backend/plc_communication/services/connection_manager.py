"""Unified connection manager for all PLC connection types"""
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings

from .base import PLCConnectionType, ConnectionStatus
from .s7_client import S7BUSClient
from .opcua_client import OpcUaClient

logger = logging.getLogger(__name__)


class PLCConnectionManager:
    """
    Singleton manager for all PLC connections
    Handles S7 BUS, CP 443-1 OPC UA Server, and External OPC UA Servers
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._connections: Dict[str, Any] = {}
        self._active_connection: Optional[str] = None

        # Load from Django settings
        self._load_configurations()

    def _load_configurations(self):
        """Load PLC configurations from Django settings"""
        # S7 BUS Configuration (Direct connection to CP 443-1)
        s7_config = getattr(settings, 'PLC_S7_CONFIG', {})
        if s7_config.get('enabled', True):
            self.add_connection(
                's7_bus',
                S7BUSClient,
                name='S7 BUS (CP 443-1)',
                ip_address=s7_config.get('ip', '192.168.0.1'),
                rack=s7_config.get('rack', 0),
                slot=s7_config.get('slot', 3)
            )

        # CP 443-1 OPC UA Server Configuration
        cp_opcua_config = getattr(settings, 'PLC_CP_OPCUA_CONFIG', {})
        if cp_opcua_config.get('enabled', False):
            self.add_connection(
                'cp_opcua_server',
                OpcUaClient,
                name='CP 443-1 OPC UA Server',
                endpoint_url=cp_opcua_config.get('endpoint_url', 'opc.tcp://192.168.0.1:4840'),
                username=cp_opcua_config.get('username'),
                password=cp_opcua_config.get('password')
            )

        # External OPC UA Server Configuration
        external_opcua_config = getattr(settings, 'PLC_EXTERNAL_OPCUA_CONFIG', {})
        if external_opcua_config.get('enabled', False):
            self.add_connection(
                'external_opcua',
                OpcUaClient,
                name='External OPC UA Server',
                endpoint_url=external_opcua_config.get('endpoint_url', 'opc.tcp://192.168.1.100:4840'),
                username=external_opcua_config.get('username'),
                password=external_opcua_config.get('password')
            )

    def add_connection(self, connection_id: str, client_class, **kwargs):
        """Add a new connection configuration"""
        try:
            client = client_class(**kwargs)
            self._connections[connection_id] = client
            logger.info(f"Added connection: {connection_id}")
        except Exception as e:
            logger.error(f"Failed to add connection {connection_id}: {e}")

    def connect(self, connection_id: str = None) -> bool:
        """
        Connect to PLC

        Args:
            connection_id: Specific connection to connect, or None for all
        """
        if connection_id:
            if connection_id in self._connections:
                success = self._connections[connection_id].connect()
                if success:
                    self._active_connection = connection_id
                return success
            return False

        # Connect to all, return True if any succeeds
        success = False
        for cid, conn in self._connections.items():
            if conn.connect():
                success = True
                if self._active_connection is None:
                    self._active_connection = cid

        return success

    def disconnect(self, connection_id: str = None):
        """Disconnect from PLC(s)"""
        if connection_id:
            if connection_id in self._connections:
                self._connections[connection_id].disconnect()
                if self._active_connection == connection_id:
                    self._active_connection = None
        else:
            for conn in self._connections.values():
                conn.disconnect()
            self._active_connection = None

    def get_active_connection(self):
        """Get currently active connection"""
        if self._active_connection:
            return self._connections.get(self._active_connection)
        return None

    def get_connection(self, connection_id: str):
        """Get connection by ID"""
        return self._connections.get(connection_id)

    def get_all_status(self) -> Dict[str, Dict]:
        """Get status of all connections"""
        return {
            cid: conn.get_status()
            for cid, conn in self._connections.items()
        }

    def read_value(self, address: str, connection_id: str = None, **kwargs) -> Any:
        """
        Read value from PLC

        Args:
            address: Tag address (S7 format or OPC UA node ID)
            connection_id: Specific connection to use
        """
        if connection_id:
            conn = self._connections.get(connection_id)
            if conn and conn.status == ConnectionStatus.CONNECTED:
                return conn.read_value(address, **kwargs)
            return None

        # Try active connection first
        active = self.get_active_connection()
        if active:
            return active.read_value(address, **kwargs)

        # Try any connected connection
        for conn in self._connections.values():
            if conn.status == ConnectionStatus.CONNECTED:
                return conn.read_value(address, **kwargs)

        return None

    def write_value(self, address: str, value: Any, connection_id: str = None, **kwargs) -> bool:
        """Write value to PLC"""
        if connection_id:
            conn = self._connections.get(connection_id)
            if conn and conn.status == ConnectionStatus.CONNECTED:
                return conn.write_value(address, value, **kwargs)
            return False

        active = self.get_active_connection()
        if active:
            return active.write_value(address, value, **kwargs)

        return False

    def register_callback(self, connection_id: str, event: str, callback):
        """Register callback for connection events"""
        if connection_id in self._connections:
            self._connections[connection_id].register_callback(event, callback)


# Singleton instance
plc_manager = PLCConnectionManager()