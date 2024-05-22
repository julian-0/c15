from pythonUtils.utils import *
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider
from pyocd.flash.loader import FlashLoader
import struct
import logging
import os

current_script_path = os.path.dirname(os.path.abspath(__file__))
parent_directory_path = os.path.dirname(current_script_path)
managed_packs_path = os.path.join(parent_directory_path, 'managed_packs')
keil_path = [os.path.join(managed_packs_path, 'Keil.STM32L4xx_DFP.2.6.2.pack'), os.path.join(managed_packs_path, 'Keil.STM32F4xx_DFP.2.17.1.pack')]

class Command:
    def execute(self, session, request, source):
        pass

class KillCommand(Command):
    def execute(self, session, request, source):
        try:
            session.close()
            print("Sesión cerrada")
        except Exception as e:
            logging.exception(e)
            print("Error al cerrar la sesión " + repr(e))
            print("Saliendo...")
        exit()

class ProbeCommand(Command):
    def execute(self, session, request, source):
        status, data, session = check_connection(session)
        if not data["probe"]:
            data = {}
            data["error"] = "No hay equipos conectados"
            return Status.ERROR.name, data, session
        #if the class is ConnectionCommand, then return ok
        if self.__class__.__name__ == "ConnectionCommand":
            return Status.OK.name, data, session
        return self.execute2(session, request, source)

class TargetCommand(Command):
    def execute(self, session, request, source):
        status, data, session = check_connection(session)
        if not data["probe"]:
            data = {}
            data["error"] = "No hay equipos conectados"
            return Status.ERROR.name, data, session
        if not (data["target"] and data["target"]["connected"]):
            data = {}
            data["error"] = "No hay un target conectado"
            return Status.ERROR.name, data, session
        # try:
        return self.execute2(session, request, source)
        # except Exception as e:
        #     data = {}
        #     data["error"] = repr(e)
        #     return Status.ERROR.name, data, session

class ConnectionCommand(ProbeCommand):
    def execute2(self, session, request, source):
        pass
    
class ConnectTargetCommand(ProbeCommand):
    def execute2(self, session, request, source):
        try:
            target_str = request['target']
            if session is None:
                session = ConnectHelper.session_with_chosen_probe(blocking=False, options={"chip_erase": "sector", "target_override": target_str, "pack": keil_path})
                session.open()
            
            target = session.board.target

            value = target.read32(0xE0042000)
            revision_id = (value >> 16) & 0xFFFF 
            device_id = value & 0xFFF

            data = {}
            revision_string = get_revision(target_str, revision_id)
            device_string = device_map.get(device_id, "Desconocido")
            revision = {}
            revision["id"] = '0x%X' % revision_id
            revision["name"] = revision_string
            device = {}
            device["id"] = '0x%X' % device_id
            device["name"] = device_string
            data["revision"] = revision
            data["device"] = device
            status = Status.OK.name

            return status, data, session
        except Exception as e:
            logging.exception(e)
            data = {}
            data["error"] = repr(e)
            return Status.ERROR.name, data, None

class DisconnectTargetCommand(ProbeCommand):
    def execute2(self, session, request, source):
        if session is not None:
            session.close()
        return Status.OK.name, {}, None
    
class GetDataCommand(ProbeCommand):
    def execute2(self, session, request, source):
        probe = ConnectHelper.get_all_connected_probes(blocking=False).pop(0)
        serial_number = probe.unique_id
        firmware_revision = "no se"

        data = {}
        stlink = {}
        stlink["serial_number"] = serial_number
        stlink["firmware_revision"] = firmware_revision
        data["stlink"] = stlink

        return Status.OK.name, data, session

class SetElfCommand(TargetCommand):
    def execute2(self, session, request, source):
        path = request['path']
        session.board.target.elf = path
        return Status.OK.name, {}, session

class ProgramCommand(TargetCommand):
    def execute2(self, session, request, source):
        path = request['path']
        target = session.board.target
        FileProgrammer(session).program(path)
        target.elf = path
        target.reset_and_halt()
        target.resume()
        data = {}
        data["path"] = path
        return Status.OK.name, data, session

class ResetCommand(TargetCommand):
    def execute2(self, session, request, source):
        target = session.board.target
        target.reset()
        return Status.OK.name, {}, session

class HaltCommand(TargetCommand):
    def execute2(self, session, request, source):
        target = session.board.target
        target.halt()
        return Status.OK.name, {}, session

class ResumeCommand(TargetCommand):
    def execute2(self, session, request, source):
        target = session.board.target
        target.resume()
        return Status.OK.name, {}, session

class MonitorCommand(TargetCommand):
    def execute2(self, session, request, source):
        variables = request['variables']
        target = session.board.target
        provider = ELFSymbolProvider(target.elf)

        variables_res = []
        for variable in variables:
            variable_addr = provider.get_symbol_value(variable["pointer"])
            value=0
            if variable_addr is None:
                res = 0
                #TODO: agregar error
                #print("Variable no encontrada " + variable["name"])
            else:
                value = target.read32(variable_addr)
                size = variable["size"]
                res=0
                try:
                    if size == 1:
                        res = target.read8(value)
                    elif size == 2:
                        res = target.read16(value)
                    elif size == 4:
                        res = target.read32(value)

                    if variable["type"] == "float":
                        res = struct.unpack('f', struct.pack('I', res))[0]
                    elif variable["type"] == "char":
                        res = struct.pack('B', res)[0]
                    elif variable["type"] == "bits":
                        res = '{0:08b}'.format(struct.pack('B', res)[0])

                except Exception as e:
                    logging.exception(e)
                    print("Error al leer la variable " + variable["name"] + " " + repr(e))
                    res = None

            variables_res.append({"name": variable["name"], "value": res})

        data = {}
        data["variables"] = variables_res
        return Status.OK.name, variables_res, session

class WriteMemoryCommand(TargetCommand):
    def execute2(self, session, request, source):
        target = session.board.target
        provider = ELFSymbolProvider(target.elf)
        loader = FlashLoader(session=session)
        variables = request['variables']
        direct_write = request['direct']
        for variable in variables:
            pointer = variable['pointer']
            
            address = provider.get_symbol_value(pointer)
            if address is None:
                #print("Variable no encontrada " + pointer)
                continue
            if not direct_write:
                address = target.read32(address)
            value = variable['value']
            
            if value is None:
                #print("Valor incorrecto " + pointer)
                continue
            #print("Variable " + pointer + " encontrada en 0x%X" % address + " a escribir valor " + str(value))
            size = variable['size']
            v_type = variable['type'] 

            #transform value to bytes according the type
            if v_type == "float":
                value = struct.unpack('!I', struct.pack('!f', value))[0]
            # elif v_type == "char":
            #     value = struct.unpack('B', struct.pack('c', value))[0]
            elif v_type == "bits":
                value = struct.unpack('B', struct.pack('b', value))[0]
            elif v_type == "short":
                value = struct.unpack('H', struct.pack('H', value))[0]

            #write data
            try:
                loader.add_data(address=address, data=value.to_bytes(size, byteorder='little'))
            except Exception as e:
                logging.exception(e)
                print("Error al escribir la variable " + pointer + " " + repr(e))
                continue
        target.reset_and_halt()
        loader.commit()
        target.resume()

        return Status.OK.name, {}, session
    
class LightLedCommand(TargetCommand):
    def execute2(self, session, request, source):
        variable = request['variable']
        target = session.board.target
        provider = ELFSymbolProvider(target.elf)
        variable_addr = provider.get_symbol_value(variable)
        value = target.read32(variable_addr)
        print("Valor de " + variable + ": " + str(value))
        if value == 0:
            target.write32(variable_addr, 1)
        else:
            target.write32(variable_addr, 0)
        
        data = {}
        data["variable"] = variable
        return Status.OK.name, data, session