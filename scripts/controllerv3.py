from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider
import threading
from enum import Enum
import time
import json

# Variable para la sesión y su bloqueo
global session
session = None
session_lock = threading.Lock()
# Variable para indicar si el programa debe seguir ejecutándose
running = True
running_lock = threading.Lock()

# Identificador de resultados
TOKEN = "#result# "

GET_DATA = 'GET_DATA'
PROGRAM = 'PROGRAM'
KILL = 'KILL'
DISCONNECTED = 'DISCONNECTED'

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

def main2():
    data = {}
    with ConnectHelper.session_with_chosen_probe() as session:
        probe = session.probe

        while(True):
            in_stream_data = input()
            parsed_stream_data = json.loads(in_stream_data)
            command = parsed_stream_data['command']

            if command == GET_DATA:
                json_data = get_data(data, session, probe)
                returnResult(json_data)

            if command == PROGRAM:
                path = parsed_stream_data['path']
                json_data = program_firmware(session, path)
                returnResult(json_data)

            if command == 'PRENDER':
                variable = parsed_stream_data['variable']
                json_data = light_led(session, variable)
                returnResult(json_data)
            # -------------------------- Script termination block ----------------------------
            if command == KILL:
                exit()
            
            session = check_connection(session)

def input_thread():
    global running, session
    data = {}
    while True:
        if len(ConnectHelper.get_all_connected_probes(blocking=False)) > 0 and session is not None:
            probe = session.probe
            in_stream_data = input()
            parsed_stream_data = json.loads(in_stream_data)
            command = parsed_stream_data['command']

            if command == GET_DATA:
                json_data = get_data(data, session, probe)
                returnResult(json_data)

            if command == PROGRAM:
                path = parsed_stream_data['path']
                json_data = program_firmware(session, path)
                returnResult(json_data)

            if command == 'PRENDER':
                variable = parsed_stream_data['variable']
                json_data = light_led(session, variable)
                returnResult(json_data)
            # -------------------------- Script termination block ----------------------------
            if command == KILL:
                with running_lock:
                    running = False
                break

def connection_thread():
    global session
    while True:
        check_connection()
        with running_lock:
            if not running:
                break
        time.sleep(1)  # Espera medio segundo antes de volver a verificar

def is_connected(session):
    #Check if the target is still alive
    try:
        with session_lock:
            session.board.target.read32(0xE0042000)
        return True
    except:
        return False

def check_connection():
    global session
    print("check_connection")
    connected = is_connected(session)
    probes_len = len(ConnectHelper.get_all_connected_probes(blocking=False))
    print("probes_len: " + str(probes_len))
    s_is_none = session is None
    print("session is None: " + str(s_is_none))
    if probes_len < 1 or s_is_none:
        with session_lock:
            session = None
        print("not connected")
        res = response(DISCONNECTED, Status.OK.name, {})
        returnResult(res)
        if len(ConnectHelper.get_all_connected_probes(blocking=False)) > 0:
            with session_lock:
                print("obteniendo nueva session")
                session = ConnectHelper.session_with_chosen_probe()

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

def get_data(data, session2, probe2):
    global session
    with session_lock:
        probe = session.probe
        serial_number = probe.unique_id
        firmware_revision = "no se"

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

def main():
    # Crear y comenzar los hilos
    input_t = threading.Thread(target=input_thread)
    connection_t = threading.Thread(target=connection_thread)

    connection_t.start()
    input_t.start()

    # Esperar a que los hilos terminen
    input_t.join()
    connection_t.join()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        response = {
            "result":"Ocurrió un error inesperado",
            "exception": e
        }
        returnResult(json.dumps(response))