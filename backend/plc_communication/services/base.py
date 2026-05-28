"""Base classes for PLC communication services"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Callable
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class ConnectionStatus(Enum):
    """Connection status enum"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"


class PLCConnectionType(Enum):
    """Types of PLC connections"""
    S7_BUS = "s7_bus"
    CP_OPCUA_SERVER = "cp_opcua_server"
    EXTERNAL_OPCUA = "external_opcua"


class BasePLCClient(ABC):
    """Abstract base class for all PLC clients"""

    def __init__(self, name: str, connection_type: PLCConnectionType):
        self.name = name
        self.connection_type = connection_type
        self.status = ConnectionStatus.DISCONNECTED
        self._callbacks: Dict[str, Callable] = {}
        self._error_message: Optional[str] = None

    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to PLC/OPC UA server"""
        pass

    @abstractmethod
    def disconnect(self) -> bool:
        """Close connection"""
        pass

    @abstractmethod
    def read_value(self, address: str, **kwargs) -> Optional[Any]:
        """Read a value from PLC"""
        pass

    @abstractmethod
    def write_value(self, address: str, value: Any, **kwargs) -> bool:
        """Write a value to PLC"""
        pass

    def get_status(self) -> Dict[str, Any]:
        """Get current connection status"""
        return {
            'name': self.name,
            'type': self.connection_type.value,
            'status': self.status.value,
            'error': self._error_message
        }

    def register_callback(self, event: str, callback: Callable):
        """Register callback for events"""
        self._callbacks[event] = callback

    def _notify(self, event: str, data: Any = None):
        """Notify registered callbacks"""
        if event in self._callbacks:
            try:
                self._callbacks[event](data)
            except Exception as e:
                logger.error(f"Callback error for {event}: {e}")