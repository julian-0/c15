
from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider
from pyocd.debug.elf.decoder import ElfSymbolDecoder
from pyocd.flash.flash import Flash
from pyocd.flash.eraser import FlashEraser
from pyocd.flash.loader import FlashLoader
import struct

import json
import time

def list_connected_probes():
    probes = ConnectHelper.get_all_connected_probes()
    for idx, p in probes:
        print("Probe #"+ idx+": " + p.vendor_name + " " + p.product_name + " " + " " + p.unique_id + " ")

def main():
    # Crear una instancia del programador ST-Link
    with ConnectHelper.session_with_chosen_probe(options={"chip_erase": "sector", "target_override": "STM32F405RGTX"}) as session:
        target = session.board.target
        firmware_elf_file = "../../../firmwares/ecg.elf"
        target.elf = firmware_elf_file
        provider = ELFSymbolProvider(target.elf)

        # Reset
        target.reset_and_halt()

        provider = ELFSymbolProvider(target.elf)

        pointer = 'cte_calibracion_imp'
        value_2 = 0xAA

        address = provider.get_symbol_value(pointer)
        # address = target.read32(address)
        print("Reading address 0x%X" % address)
        value = target.read8(address)
        print("Value: 0x%X" % value)

        #transform value to bytes
        # value = struct.unpack('!I', struct.pack('!f', value))[0]

        #write data
        print("Writing in 0x%X" % address + " the value 0x%X" % value_2)

        # loader = FlashLoader(session=session)
        eraser = FlashEraser(session=session, mode=FlashEraser.Mode.CHIP)
        print("Erasing sector 0x%X" % address)
        eraser.erase([address])
        # print("Erased")
        # loader.add_data(address=address, data=value_2.to_bytes(4, byteorder='little'))
        # loader.commit()
        value = target.read8(address)
        print("Value: 0x%X" % value)

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