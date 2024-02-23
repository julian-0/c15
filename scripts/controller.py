from pythonUtils.commands import *
import json
import logging
import sys

# Identificador de resultados
TOKEN = "#result# "

def handle_input(session, in_stream_data):
    parsed_stream_data = json.loads(in_stream_data)
    command_name = parsed_stream_data['command']
    source = parsed_stream_data['source']

    # Crea un diccionario que mapea nombres de comandos a clases de comandos
    command_map = {
        'KILL': KillCommand(),
        'CONNECTION': ConnectionCommand(),
        'CONNECT_TARGET': ConnectTargetCommand(),
        'DISCONNECT_TARGET': DisconnectTargetCommand(),
        'GET_DATA': GetDataCommand(),
        'SET_ELF_FILE': SetElfCommand(),
        'PROGRAM': ProgramCommand(),
        'RESET': ResetCommand(),
        'HALT': HaltCommand(),
        'RESUME': ResumeCommand(),
        'MONITOR': MonitorCommand(),
        'PRENDER': LightLedCommand(),
        'WRITE_FLASH': WriteMemoryCommand()
    }

    # Obtén la clase de comando correspondiente y ejecútala
    if command_name in command_map:
        command = command_map[command_name]
        try:
            status, data, session = command.execute(session, parsed_stream_data, source)
            return response(command_name, status, data, source), session
        except Exception as e:
            logging.exception(e)
            data = {}
            data["error"] = repr(e)
            return response(command_name, Status.ERROR.name, data, source), None
    else:
        data = {}
        data["error"] = "Comando desconocido"
        return response(command_name, Status.ERROR.name, data, source), session

def main():
    session = None
    while True:
        print("esperando comando")
        in_stream_data = input()
        result, session = handle_input(session, in_stream_data)
        returnResult(result)

def returnResult(result):
    print(TOKEN+result)

if __name__ == "__main__":
    # logging.basicConfig(filename='application.log', level=logging.ERROR)
    logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
    ch = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s;%(levelname)s;%(message)s", "%Y-%m-%d %H:%M:%S")
    ch.setFormatter(formatter)
    # add ch to logger
    logging.getLogger().addHandler(ch)

    # main()
    print("Starting controller")
    try:
        main()
    except Exception as e:
        print("Hubo un error" + repr(e))
        response = {
            "result":"Ocurrió un error inesperado",
            "exception": repr(e)
        }
        logging.exception(e)
        returnResult(json.dumps(response))