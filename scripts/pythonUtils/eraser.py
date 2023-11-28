
from pyocd.core.helpers import ConnectHelper
from pyocd.flash.eraser import FlashEraser


def main():
    # Crear una instancia del programador ST-Link
    with ConnectHelper.session_with_chosen_probe(options={"chip_erase": "sector", "target_override": "STM32F429IITx"}) as session:

        eraser = FlashEraser(session=session, mode=FlashEraser.Mode.CHIP)
        eraser.erase()
        print("Chip erased")

if __name__ == "__main__":
    main()