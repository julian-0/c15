from pythonUtils.commands import *
import json

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
        'PRENDER': LightLedCommand()
    }

    # Obtén la clase de comando correspondiente y ejecútala
    if command_name in command_map:
        command = command_map[command_name]
        status, data, session = command.execute(session, parsed_stream_data, source)
        return response(command_name, status, data, source), session
    else:
        data = {}
        data["error"] = "Comando desconocido"
        return response(command_name, Status.ERROR.name, data, source), session

def main():
    session = None
    while True:
        in_stream_data = input()
        result, session = handle_input(session, in_stream_data)
        returnResult(result)

def returnResult(result):
    print(TOKEN+result)

if __name__ == "__main__":
    main()
    # try:
    #     main()
    # except Exception as e:
    #     response = {
    #         "result":"Ocurrió un error inesperado",
    #         "exception": repr(e)
    #     }
    #     returnResult(json.dumps(response))