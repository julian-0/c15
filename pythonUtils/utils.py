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
    0x471: "STM32L4P5",
    # ...otros valores de dispositivo...
    0x435: "STM32L4(3|4)",
    0x462: "STM32L4(5|6)",
    0x464: "STM32L4(1|2)"
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
    
    targetConnected = session is not None
    targetObj = {}
    targetObj["connected"] = targetConnected
    if targetConnected:
        targetObj["state"] = session.target.get_state().name

    return Status.OK.name, {'probe': True, 'target': targetObj}, session