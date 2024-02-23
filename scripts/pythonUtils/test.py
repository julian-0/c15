
from pyocd.core.helpers import ConnectHelper

if __name__ == "__main__":
    print("Dispositivos conectados antes de conectar: "+ str(len(ConnectHelper.get_all_connected_probes(blocking=False))))
    ConnectHelper.list_connected_probes()
    with ConnectHelper.session_with_chosen_probe(options={"chip_erase": "sector", "target_override": "STM32L431VCTx"}) as session:
        ConnectHelper.list_connected_probes()
        #print if session is open
        print("Sesion abierta: " + str(session.is_open))
        print(session.board.target.get_state().name)
        print("Dispositivos conectados despues de conectar: "+ str(len(ConnectHelper.get_all_connected_probes(blocking=False))))
