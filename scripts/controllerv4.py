from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider
from enum import Enum
import time
import json

# Identificador de resultados
TOKEN = "#result# "

GET_DATA = 'GET_DATA'
PROGRAM = 'PROGRAM'
KILL = 'KILL'
CONNECTION = 'CONNECTION'

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

def list_connected_probes():
    probes = ConnectHelper.get_all_connected_probes()
    for idx, p in probes:
        returnResult("Probe #"+ idx+": " + p.vendor_name + " " + p.product_name + " " + " " + p.unique_id + " ")

def main():
    session = None
    while(True):
        in_stream_data = input()
        parsed_stream_data = json.loads(in_stream_data)
        command = parsed_stream_data['command']

        if command == CONNECTION:
            res, session = check_connection(session)
            returnResult(res)
        elif command == KILL:
            exit()
        else:
            res, session = check_connection(session)
            parsed_res = json.loads(res)
            if parsed_res["status"] == Status.ERROR.name:
                data = {}
                data["error"] = "No hay equipos conectados"
                res = response(command, Status.ERROR.name, data)
                returnResult(res)
                continue
            if command == GET_DATA:
                json_data = get_data(session)
                returnResult(json_data)

            if command == PROGRAM:
                path = parsed_stream_data['path']
                json_data = program_firmware(session, path)
                returnResult(json_data)

            if command == 'PRENDER':
                variable = parsed_stream_data['variable']
                json_data = light_led(session, variable)
                returnResult(json_data)
            
            
            #session = check_connection(session)

def is_connected(session):
    #Check if the target is still alive
    try:
        session.board.target.read32(0xE0042000)
        return True
    except:
        return False

def check_connection(session):
    if len(ConnectHelper.get_all_connected_probes(blocking=False)) < 1 or session is None:
        session = None
        if len(ConnectHelper.get_all_connected_probes(blocking=False)) > 0:
            session = ConnectHelper.session_with_chosen_probe(blocking=False)
            if session is not None:
                session.open()
                return response(CONNECTION, Status.OK.name, {}), session
            #target.selected_core.flush
            #target .reset .flush .disconnect
        return response(CONNECTION, Status.ERROR.name, {}), None
    else:
        return response(CONNECTION, Status.OK.name, {}), session

def returnResult(result):
    print(TOKEN+result)

def response(command, status, data):
    response = {}
    response["command"] = command
    response["status"] = status
    response["data"] = data
    return json.dumps(response)

def light_led(session, variable):
        target = session.board.target
        target.reset_and_halt()
        target.resume()
        provider = ELFSymbolProvider(target.elf)
        variable_addr = provider.get_symbol_value(variable)
        target.write32(variable_addr, 1)
        time.sleep(3)
        target.write32(variable_addr, 0)
        
        data = {}
        data["variable"] = variable
        return response("PRENDER", Status.OK.name, data)

def program_firmware(session, path):
        FileProgrammer(session).program(path)
        session.board.target.elf = path
        data = {}
        data["path"] = path
        return response(PROGRAM, Status.OK.name, data)

def get_data(session):
    serial_number = session.probe.unique_id
    firmware_revision = "no se"

    data = {}
    stlink = {}
    stlink["serial_number"] = serial_number
    stlink["firmware_revision"] = firmware_revision
    data["stlink"] = stlink

    target = session.board.target

    value = target.read32(0xE0042000)
    revision_id = (value >> 16) & 0xFFFF 
    device_id = value & 0xFFF

    revision_string = revision_map.get(revision_id, "Desconocido")
    device_string = device_map.get(device_id, "Desconocido")
    revision = {}
    revision["id"] = revision_id
    revision["name"] = revision_string
    device = {}
    device["id"] = device_id
    device["name"] = device_string
    data["revision"] = revision
    data["device"] = device
    return response(GET_DATA, Status.OK.name, data)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        response = {
            "result":"Ocurrió un error inesperado",
            "exception": repr(e)
        }
        returnResult(json.dumps(response))