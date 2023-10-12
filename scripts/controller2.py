from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider


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
        firmware_elf_file = "../firmwares/Descarga.elf"

        # Load firmware into device.
        #FileProgrammer(session).program(firmware_elf_file)
        print("Target status: " + str(target.get_state()))

        target.elf = firmware_elf_file

        provider = ELFSymbolProvider(target.elf)
        led_azul_addr = provider.get_symbol_value("led_azul")
        led_rojo_addr = provider.get_symbol_value("led_rojo")
        boton_addr = provider.get_symbol_value("boton")

        # Reset
        target.reset_and_halt()
        print("Target status: " + str(target.get_state()))

        # Read some registers.
        print("led_azul_addr: 0x%X" % led_azul_addr)
        print("led_rojo_addr: 0x%X" % led_rojo_addr)

        print("led_rojo: %d" % target.read32(led_rojo_addr))

        target.step()

        target.write32(led_azul_addr, 1)
        print("led_azul: %d" % target.read32(led_azul_addr))
        print("led_rojo: %d" % target.read32(led_rojo_addr))
        print("boton: %d" % target.read32(boton_addr))
        print("pc: 0x%X" % target.read_core_register('pc'))
        
        target.resume()
        print("Target status: " + str(target.get_state()))
        #check if microcontroller is connected

        target.halt()
        print("Target status: " + str(target.get_state()))
    
        target.write32(led_azul_addr, 0)
        print("led_azul: %d" % target.read32(led_azul_addr))
        print("led_rojo: %d" % target.read32(led_rojo_addr))
        print("boton: %d" % target.read32(boton_addr))
        print("pc: 0x%X" % target.read_core_register('pc'))

        target.resume()
        time.sleep(1)
        
        target.write32(led_azul_addr, 1)
        print("led_azul: %d" % target.read32(led_azul_addr))
        print("led_rojo: %d" % target.read32(led_rojo_addr))
        print("boton: %d" % target.read32(boton_addr))

        for i in range(0, 1):
            target.write32(led_azul_addr, 1)
            target.write32(led_rojo_addr, 0)
            time.sleep(1)
            target.write32(led_azul_addr, 0)
            target.write32(led_rojo_addr, 1)
            time.sleep(1)
            value = target.read32(0xE0042000)
            print("value: %d" % value)

        target.resume()
        time.sleep(1)
        target.reset_and_halt()

        print("Buscando conexiones")
        for i in range(0, 0):
            le = len(ConnectHelper.get_all_connected_probes(blocking=False))
            print("Conexiones: " + str(le))
            #print if is_connected
            print("is_connected: " + str(is_connected(session)))
            #session = ConnectHelper.session_with_chosen_probe(blocking=False)
            time.sleep(1)
        
        print("Salirendo del for")
    i = 0;
    for variable in provider._symbols.symbol_dict:
        print("Symbol #"+ str(i) + ": " + variable)
        i = i + 1

def is_connected(session):
    #Check if the session is still alive
    try:
        session.board.target.read32(0xE0042000)
        return True
    except:
        return False
    
if __name__ == "__main__":
    main()