from pythonUtils.utils import *
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider


class Command:
    def execute(self, session, request, source):
        pass

class KillCommand(Command):
    def execute(self, session, request, source):
        try:
            session.close()
            print("Sesión cerrada")
        except Exception as e:
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
        if not data["target"]:
            data = {}
            data["error"] = "No hay un target conectado"
            return Status.ERROR.name, data, session
        return self.execute2(session, request, source)

class ConnectionCommand(ProbeCommand):
    def execute2(self, session, request, source):
        pass
    
class ConnectTargetCommand(ProbeCommand):
    def execute2(self, session, request, source):
        if session is None:
            session = ConnectHelper.session_with_chosen_probe(blocking=False, options={"chip_erase": "chip", "target_override": "STM32L4P5ZGTx"})
            session.open()
        
        target = session.board.target

        value = target.read32(0xE0042000)
        revision_id = (value >> 16) & 0xFFFF 
        device_id = value & 0xFFF

        data = {}
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
        status = Status.OK.name

        return status, data, session

class DisconnectTargetCommand(ProbeCommand):
    def execute2(self, session, request, source):
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
            variable_addr = provider.get_symbol_value(variable)
            value = target.read32(variable_addr)
            variables_res.append({"name": variable, "value": value})

        data = {}
        data["variables"] = variables_res
        return Status.OK.name, variables_res, session

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