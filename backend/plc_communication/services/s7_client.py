# plc_communication/services/s7_client.py
import logging
from typing import Any, Optional, Dict
from .base import BasePLCClient, PLCConnectionType, ConnectionStatus
from snap7 import client as snap7_client  # Correct import
from snap7.util import *
import snap7

logger = logging.getLogger(__name__)


class S7BUSClient(BasePLCClient):
    """
    S7 Protocol client for direct BUS connection
    Works with CP 443-1 using standard S7 communication (PORT 102)
    """

    def __init__(self, name: str, ip_address: str, rack: int = 0, slot: int = 3):
        """
        Initialize S7 client for Siemens S7-400

        Args:
            name: Client identifier
            ip_address: CP 443-1 IP address
            rack: Rack number (default 0 for S7-400)
            slot: Slot number (3 for CPU 417-4H)
        """
        super().__init__(name, PLCConnectionType.S7_BUS)
        self.ip_address = ip_address
        self.rack = rack
        self.slot = slot
        self._client: Optional[snap7_client.Client] = None

    def connect(self) -> bool:
        """Establish S7 connection to CP 443-1"""
        if self.status == ConnectionStatus.CONNECTED:
            return True

        self.status = ConnectionStatus.CONNECTING
        self._error_message = None

        try:
            self._client = snap7_client.Client()
            # This is the direct connection to CP 443-1
            self._client.connect(self.ip_address, self.rack, self.slot)
            self.status = ConnectionStatus.CONNECTED
            logger.info(f"S7 connected to {self.ip_address} (Rack={self.rack}, Slot={self.slot})")
            self._notify('connected')
            return True

        except Exception as e:
            self.status = ConnectionStatus.ERROR
            self._error_message = str(e)
            logger.error(f"S7 connection failed: {e}")
            return False

    def disconnect(self) -> bool:
        """Disconnect S7 client"""
        try:
            if self._client:
                self._client.disconnect()
                self._client = None
            self.status = ConnectionStatus.DISCONNECTED
            logger.info("S7 disconnected")
            self._notify('disconnected')
            return True
        except Exception as e:
            logger.error(f"Disconnect error: {e}")
            return False

    def _ensure_connected(self) -> bool:
        """Ensure connection exists before operation"""
        if self.status != ConnectionStatus.CONNECTED:
            return self.connect()
        return True

    def read_db_block(self, db_number: int, start: int, size: int) -> Optional[bytearray]:
        """Read raw bytes from Data Block"""
        if not self._ensure_connected():
            return None

        try:
            data = self._client.db_read(db_number, start, size)
            return data
        except Exception as e:
            logger.error(f"Failed to read DB{db_number}: {e}")
            return None

    def write_db_block(self, db_number: int, start: int, data: bytearray) -> bool:
        """Write raw bytes to Data Block"""
        if not self._ensure_connected():
            return False

        try:
            self._client.db_write(db_number, start, data)
            logger.debug(f"Written to DB{db_number} at byte {start}")
            return True
        except Exception as e:
            logger.error(f"Failed to write DB{db_number}: {e}")
            return False

    def read_int(self, db_number: int, byte_offset: int) -> Optional[int]:
        """Read INT (16-bit signed) from DB"""
        data = self.read_db_block(db_number, byte_offset, 2)
        if data:
            # Use snap7.util to extract int
            return get_int(data, 0)
        return None

    def write_int(self, db_number: int, byte_offset: int, value: int) -> bool:
        """Write INT (16-bit signed) to DB"""
        data = bytearray(2)
        set_int(data, 0, value)
        return self.write_db_block(db_number, byte_offset, data)

    def read_real(self, db_number: int, byte_offset: int) -> Optional[float]:
        """Read REAL (32-bit float) from DB"""
        data = self.read_db_block(db_number, byte_offset, 4)
        if data:
            # Use snap7.util to extract real
            return get_real(data, 0)
        return None

    def write_real(self, db_number: int, byte_offset: int, value: float) -> bool:
        """Write REAL (32-bit float) to DB"""
        data = bytearray(4)
        set_real(data, 0, value)
        return self.write_db_block(db_number, byte_offset, data)

    def read_bool(self, db_number: int, byte_offset: int, bit: int) -> Optional[bool]:
        """Read BOOL from DBX"""
        data = self.read_db_block(db_number, byte_offset, 1)
        if data:
            return get_bool(data, 0, bit)
        return None

    def write_bool(self, db_number: int, byte_offset: int, bit: int, value: bool) -> bool:
        """Write BOOL to DBX"""
        data = self.read_db_block(db_number, byte_offset, 1)
        if data is None:
            data = bytearray(1)
        set_bool(data, 0, bit, value)
        return self.write_db_block(db_number, byte_offset, data)

    def read_value(self, address: str, **kwargs) -> Optional[Any]:
        """
        Read value using Siemens address syntax

        Supported formats:
        - DB10.INT0 - INT at DB10 byte 0
        - DB10.REAL4 - REAL at DB10 byte 4
        - DB10.BOOL0.0 - BOOL at DB10 byte 0 bit 0
        """
        return self._parse_and_read(address)

    def write_value(self, address: str, value: Any, **kwargs) -> bool:
        """Write value using Siemens address syntax"""
        return self._parse_and_write(address, value)

    def _parse_and_read(self, address: str) -> Optional[Any]:
        """Parse Siemens address format and read"""
        import re
        pattern = r'DB(\d+)\.(\w+)(\d+)(?:\.(\d+))?'
        match = re.match(pattern, address.upper())

        if not match:
            logger.error(f"Invalid address format: {address}")
            return None

        db_num = int(match.group(1))
        data_type = match.group(2)
        offset = int(match.group(3))
        bit = int(match.group(4)) if match.group(4) else None

        if data_type == 'INT':
            return self.read_int(db_num, offset)
        elif data_type == 'REAL':
            return self.read_real(db_num, offset)
        elif data_type == 'BOOL' and bit is not None:
            return self.read_bool(db_num, offset, bit)
        else:
            logger.error(f"Unsupported type: {data_type}")
            return None

    def _parse_and_write(self, address: str, value: Any) -> bool:
        """Parse Siemens address format and write"""
        import re
        pattern = r'DB(\d+)\.(\w+)(\d+)(?:\.(\d+))?'
        match = re.match(pattern, address.upper())

        if not match:
            logger.error(f"Invalid address format: {address}")
            return False

        db_num = int(match.group(1))
        data_type = match.group(2)
        offset = int(match.group(3))
        bit = int(match.group(4)) if match.group(4) else None

        if data_type == 'INT':
            return self.write_int(db_num, offset, int(value))
        elif data_type == 'REAL':
            return self.write_real(db_num, offset, float(value))
        elif data_type == 'BOOL' and bit is not None:
            return self.write_bool(db_num, offset, bit, bool(value))
        else:
            logger.error(f"Unsupported type: {data_type}")
            return False

    def get_cpu_info(self) -> Optional[Dict]:
        """Get PLC CPU information"""
        if not self._ensure_connected():
            return None

        try:
            info = self._client.get_cpu_info()
            return {
                'module_name': info.ModuleName,
                'copyright': info.Copyright,
                'serial_number': info.SerialNumber,
                'module_type': info.ModuleType,
                'version': f"{info.Version}"
            }
        except Exception as e:
            logger.error(f"Failed to get CPU info: {e}")
            return None