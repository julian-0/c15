from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider
from pyocd.debug.elf.decoder import ElfSymbolDecoder
import json


import time

def list_connected_probes():
    probes = ConnectHelper.get_all_connected_probes()
    for idx, p in probes:
        print("Probe #"+ idx+": " + p.vendor_name + " " + p.product_name + " " + " " + p.unique_id + " ")

def main():
    # Crear una instancia del programador ST-Link
    with ConnectHelper.session_with_chosen_probe(options={"chip_erase": "chip", "target_override": "STM32L4P5ZGTx"}) as session:
        # Obtener información sobre el programador
        probe = session.probe

        print("Información del programador:")
        print(f"Vendor name: {probe.vendor_name}")
        print(f"Product name: {probe.product_name}")
        print(f"Description: {probe.description}")
        print(f"Unique id: {probe.unique_id}")
        print(f"Capabilities: {probe.capabilities}")

        target = session.board.target
        print("Target status: " + str(target.get_state()))

        # Obtener información sobre el microcontrolador
        print("Información del microcontrolador:")
        print(f"Part number: {target.part_number}")
        print("pc: 0x%X" % target.read_core_register('pc'))
        firmware_elf_file = "../firmwares/SC1902.elf"

        # Load firmware into device.
        print("Target status: " + str(target.get_state()))

        target.elf = firmware_elf_file

        provider = ELFSymbolProvider(target.elf)

        # Reset
        target.reset_and_halt()
        print("Target status: " + str(target.get_state()))

        target.resume()
        print("Target status: " + str(target.get_state()))
        #check if microcontroller is connected

        target.halt()
        print("Target status: " + str(target.get_state()))

        target.resume()

        print(type(target.elf))
        decoder = target.elf.symbol_decoder
        print(type(decoder))
        #i = 0;
        #for variable, symbol in decoder.symbol_dict.items():
        #    if symbol.type == "STT_OBJECT":
        #        print("Symbol #"+ str(i) + ": " + variable + " size: " + str(symbol.size))
        #        i = i + 1
        read_pointer_value(decoder, target, "tipo_paletas_ptr")

def read_pointer_value(decoder, target, pointer_name):
    symbol = decoder.symbol_dict[pointer_name]
    if symbol == None:
        return None
    else:
        print("ptr address: 0x%X" % symbol.address)
        variable_addr = target.read32(symbol.address)
        print("variable address: 0x%X" % variable_addr)

        variable = decoder.get_symbol_for_address(variable_addr)
        print("variable:")
        print(variable)
        variable_size = variable.size
        print("variable size: " + str(variable_size))
        value = None
        if variable_size == 4:
            value = target.read32(variable_addr)
        elif variable_size == 2:
            value = target.read16(variable_addr)
        print("value: " + str(value))
        return value


def is_connected(session):
    #Check if the session is still alive
    try:
        session.board.target.read32(0xE0042000)
        return True
    except:
        return False
    
if __name__ == "__main__":
    main()

