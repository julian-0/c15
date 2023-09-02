from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.debug.elf.symbols import ELFSymbolProvider


import time

def list_connected_probes():
    probes = ConnectHelper.get_all_connected_probes()
    print("Probes size: " + str(len(probes)))
    p = probes.pop(0)
    
    print("Probe #0"+": " + p.vendor_name + " " + p.product_name + " " + " " + p.unique_id + " ")
    return p

def main():
    # Crear una instancia del programador ST-Link
    p = list_connected_probes()
    with ConnectHelper.session_with_chosen_probe(unique_id=p.unique_id) as session:
        # Obtener información sobre el programador
        probe = session.probe

        print("Información del programador:")
        print(f"Vendor name: {probe.vendor_name}")
        print(f"Product name: {probe.product_name}")
        print(f"Description: {probe.description}")
        print(f"Unique id: {probe.unique_id}")
        print(f"Capabilities: {probe.capabilities}")

        target = session.board.target
        session.board.target.read32(0xE0042000)
        session.close()
        print("Session closed")
        session2 = ConnectHelper.session_with_chosen_probe(unique_id=p.unique_id)
        session2.open()
        session2.board.target.read32(0xE0042000)
        session2.close()
        print("Session2 closed")


def is_connected(session):
    #Check if the session is still alive
    try:
        session.board.target.read32(0xE0042000)
        return True
    except:
        return False
    
if __name__ == "__main__":
    main()