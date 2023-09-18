import json
from enum import Enum
from pyocd.core.helpers import ConnectHelper

class Status(Enum):
    OK, ERROR = range(2)

# Mapas de revisión y dispositivo
revision_map = {
    0x1000: "Rev A",
    0x1001: "Rev Z",
    0x1003: "Rev Y",
    0x100F: "Rev W",
    0x101F: "Rev V"
    # ...otros valores de revisión...
}

device_map = {
    0x470: "STM32L4R",
    0x471: "STM32L4P5"
    # ...otros valores de dispositivo...
}

def response(command, status, data, source):
    response = {}
    response["command"] = command
    response["status"] = status
    response["data"] = data
    response["source"] = source
    return json.dumps(response)

def check_connection(session):
    if len(ConnectHelper.get_all_connected_probes(blocking=False)) < 1:
        session = None
        return Status.OK.name, {'probe': False, 'target': False}, session

    return Status.OK.name, {'probe': True, 'target': session is not None}, session