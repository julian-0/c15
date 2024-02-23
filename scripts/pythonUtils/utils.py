import json
from json import JSONEncoder
import math
# import numpy as np
from enum import Enum
from pyocd.core.helpers import ConnectHelper
import logging
import traceback

class Status(Enum):
    OK, ERROR = range(2)

def STM32L41_2_3_4_5_6():
    return {
        0x1000: "Revision A",
        0x1001: "Revision Z",
        0x1003: "Revision Y",
        0x100F: "Revision W",
        0x101F: "Revision V"
    }

def STM32L4R_S():
    return {
        0x1000: "Revision A",
        0x1001: "Revision Z",
        0x1003: "Revision Y",
        0x100F: "Revision W",
        0x101F: "Revision V"
    }

def STM32L4P5_Q5():
    return {
        0x1001: "Revision Z"
    }

def STM32F42_3():
    return {
        0x1000: "Revision A",
        0x1003: "Revision Y",
        0x1007: "Revision 1",
        0x2001: "Revision 3",
        0x2003: "Revision 5 and B"
    }

def STM32F405_07__STM32F415_17():
    return {
        0x1000: "Revision A",
        0x1001: "Revision Z",
        0x1003: "Revision 1",
        0x1007: "Revision 2",
        0x100F: "Revision Y and 4",
        0x101F: "Revision 5 and 6"
    }

revision_dict = {
    "stm32l41": STM32L41_2_3_4_5_6(),
    "stm32l42": STM32L41_2_3_4_5_6(),
    "stm32l43": STM32L41_2_3_4_5_6(),
    "stm32l44": STM32L41_2_3_4_5_6(),
    "stm32l45": STM32L41_2_3_4_5_6(),
    "stm32l46": STM32L41_2_3_4_5_6(),
    "stm32l4r": STM32L4R_S(),
    "stm32l4s": STM32L4R_S(),
    "stm32l4p5": STM32L4P5_Q5(),
    "stm32l4q5": STM32L4P5_Q5(),
    "stm32f405": STM32F405_07__STM32F415_17(),
    "stm32f407": STM32F405_07__STM32F415_17(),
    "stm32f415": STM32F405_07__STM32F415_17(),
    "stm32f417": STM32F405_07__STM32F415_17(),
    "stm32f42": STM32F42_3(),
    "stm32f43": STM32F42_3()
}

device_map = {
    0x470: "STM32L4(R|S)",
    0x471: "STM32L4(P|Q)5",
    0x435: "STM32L4(3|4)",
    0x462: "STM32L4(5|6)",
    0x464: "STM32L4(1|2)",
    0x413: "STM32F4(05|07)|(15|17)",
    0x419: "STM32F4(2|3)"
}



def nan2None(obj):
    if isinstance(obj, dict):
        return {k:nan2None(v) for k,v in obj.items()}
    elif isinstance(obj, list):
        return [nan2None(v) for v in obj]
    elif isinstance(obj, float) and math.isnan(obj):
        return None
    return obj

class NanConverter(JSONEncoder):
    def default(self, obj):
        # possible other customizations here 
        pass
    def encode(self, obj, *args, **kwargs):
        obj = nan2None(obj)
        return super().encode(obj, *args, **kwargs)
    def iterencode(self, obj, *args, **kwargs):
        obj = nan2None(obj)
        return super().iterencode(obj, *args, **kwargs)
    
def response(command, status, data, source):
    response = {}
    response["command"] = command
    response["status"] = status
    response["data"] = data
    response["source"] = source
    return json.dumps(response, cls=NanConverter)

def check_connection(session):
    if (not is_connected(session)) and len(ConnectHelper.get_all_connected_probes(blocking=False)) < 1:
        session = None
        return Status.OK.name, {'probe': False, 'target': False}, session
    try:
        targetConnected = session is not None
        targetObj = {}
        targetObj["connected"] = targetConnected
        if targetConnected:
            targetObj["state"] = session.target.get_state().name

        return Status.OK.name, {'probe': True, 'target': targetObj}, session
    except Exception as e:
        logging.exception(e)
        traceback.print_exc()
        session = None
        return Status.ERROR.name, {'probe': True, 'target': False, 'error': repr(e)}, session

def get_revision(target_str, revision_id):
    revision_string = "Desconocido"
    for key in revision_dict:
        if target_str.casefold().startswith(key.lower()):
            target_dict = revision_dict[key]
            revision_string = target_dict.get(revision_id, "Desconocido")
    return revision_string

def is_connected(session):
    #Check if the session is still alive
    try:
        session.board.target.read32(0xE0042000)
        return True
    except:
        return False