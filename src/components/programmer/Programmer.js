import React from 'react'
import './Programmer.css'
import { FaPowerOff } from 'react-icons/fa';
import FileInput from '../fileInput/FileInput'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';

const electron = window.require('electron');
const { ipcRenderer } = electron;

class Programmer extends MicroConnected {

    constructor(props) {
        super(props);
        this.state = {
            probeConnected: false,
            targetConnected: false,
            serialNumber: '',
            firmwareRevision: '--',
            revName: '--',
            devName: '--',
            elfPath: undefined,
            paused: false
        };
        this.intervalId = null;
        this.getData = this.getData.bind(this);
        this.programElf = this.programElf.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.toggleConexion = this.toggleConexion.bind(this);
        this.disableConnection = this.disableConnection.bind(this);
        this.reset = this.reset.bind(this);
        this.halt = this.halt.bind(this);
        this.resume = this.resume.bind(this);
    }

    componentDidMount() {
        // 3. Setup listener for controller python output (bounced from main process)
        ipcRenderer.on('CONTROLLER_RESULT_PROGRAMMER', (event, args) => {
            let data = args.data;
            switch (data.command) {
                case "GET_DATA":
                    this.processGetDataResult(data);
                    break;
                case "PROGRAM":
                    //this.processProgramResult(data);
                    break;
                case "CONNECTION":
                    this.processCheckConnectionResult(data);
                    break;
                case "CONNECT_TARGET":
                    this.processConnectResult(data);
                    break;
                case "DISCONNECT_TARGET":
                    this.processDisconnectResult(data);
                    break;
                case "SET_ELF_FILE":
                    this.processSetElfFile(data)
                    break;
                case "RESET":
                    this.processResetResult(data);
                    break;
                case "HALT":
                    this.processHaltResult(data);
                    break;
                case "RESUME":
                    this.processResumeResult(data);
                    break;
                default:
                    console.log("Unknown command: " + data.command);
            }
        });
        this.getData();
        this.intervalId = setInterval(() => {
            this.checkConnection();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Limpia el intervalo cuando el componente se desmonta
        if (this.state.targetConnected) {
            this.disableConnection();
        }
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_PROGRAMMER');
        toast.dismiss(); // Close all toasts
    }

    processResetResult(response) {
        if (response.status === 'OK') {
            toast.success('Reseteado', Programmer.toastProperties);
            //this.setState({ paused: true });
        }
    }

    processHaltResult(response) {
        if (response.status === 'OK') {
            toast.success('Pausado', Programmer.toastProperties);
            this.setState({ paused: true });
        }
    }

    processResumeResult(response) {
        if (response.status === 'OK') {
            toast.success('Reaunudado', Programmer.toastProperties);
            this.setState({ paused: false });
        }
    }

    processCheckConnectionResult(response) {
        if (!response.data.probe) {
            this.setState({
                probeConnected: false,
                targetConnected: false,
                serialNumber: '',
                firmwareRevision: '--',
                revName: '--',
                devName: '--',
                elfPath: undefined
            });
            this.props.updateTargetState(false);
            return;
        }
        if (!response.data.target.connected) {
            this.setState({
                targetConnected: false,
                targetStatus: undefined,
                revName: '--',
                devName: '--',
                elfPath: undefined
            });
            this.props.updateTargetState(false);
        }
        else if (response.data.target.state) {
            this.setState({ paused: response.data.target.state === "HALTED" });
        }

        if (this.state.probeConnected === false) {
            this.getData();
        }
        this.setState({ probeConnected: true });
    }

    sendToMicroProgrammer(command, body) {
        this.sendToMicro(command, 'PROGRAMMER', body);
    }

    checkConnection() {
        this.sendToMicroProgrammer("CONNECTION");
    }

    processGetDataResult(response) {
        if (response.status === 'ERROR') {
            toast.error('Error conectandose al micro', Programmer.toastProperties)
            return;
        }

        let data = response.data;
        this.setState({
            probeConnected: true,
            serialNumber: data.stlink.serial_number,
            firmwareRevision: data.stlink.firmware_revision
        });
    }

    processConnectResult(response) {
        if (response.status === 'ERROR') {
            if (response.data.error.includes('USBError')) {
                toast.error('Reconecte el usb', Programmer.toastProperties)
                return;
            }
            else if (response.data.error.includes('STLink error (9): Get IDCODE')) {
                toast.error('Revisar alimentación o reiniciar equipo', Programmer.toastProperties)
                return;
            }
            toast.error('Error conectandose al micro: ' + response.data.error, Programmer.toastProperties)
            return;
        }

        let data = response.data;
        this.setState({
            targetConnected: true,
            revName: data.revision.name,
            devName: data.device.name,
            paused: true
        });
    }

    processDisconnectResult(response) {
        if (response.status === 'ERROR') {
            return;
        }

        this.setState({
            targetConnected: false,
            revName: '--',
            devName: '--'
        });
        this.props.updateTargetState(false);
    }

    getData() {
        // 6. Sending data to controller (process already running)
        this.sendToMicroProgrammer("GET_DATA");
    }

    programElf() {
        if (!this.state.elfPath || this.state.elfPath === '')
            return;
        this.sendToMicroProgrammer("PROGRAM", { path: this.state.elfPath });

        const disconnectPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('Programar tomó demasiado tiempo');
            }, 5*60*1000);

            const proccess = (event, args) => {
                let data = args.data;
                switch (data.command) {
                    case "PROGRAM":
                        if (data.status === 'OK') {
                            resolve(); // Resuelve la promesa cuando la escritura es exitosa
                        }
                        else {
                            reject('Error al programar'); // Rechaza la promesa en caso de error
                        }
                        ipcRenderer.removeListener('CONTROLLER_RESULT_PROGRAMMER', proccess);
                        break;
                    default:
                        break;
                }
            };

            ipcRenderer.on('CONTROLLER_RESULT_PROGRAMMER', proccess);
        });

        // Toast.promise espera que la promesa se complete (resuelta o rechazada) antes de mostrar el mensaje.
        toast.promise(
            disconnectPromise,
            {
                pending: 'Programando firmware...',
                success: 'Programado',
                error: 'Error al programar'
            },
            Programmer.toastProperties
        );
    }

    processSetElfFile(response) {
        if (response.status === 'OK')
            this.props.updateTargetState(true);
        else
            this.setState({ elfPath: undefined });
    }

    updateFile(elfPath) {
        this.setState({ elfPath: elfPath });
        this.sendToMicroProgrammer("SET_ELF_FILE", { path: elfPath });
    }

    toggleConexion() {
        if (this.state.targetConnected) {
            return;
        }
        this.sendToMicroProgrammer("CONNECT_TARGET", { target: this.props.target });
    }

    disableConnection() {
        if (!this.state.targetConnected) {
            return;
        }
        this.sendToMicroProgrammer("DISCONNECT_TARGET");

        const disconnectPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('Desconectar tomó demasiado tiempo');
            }, 10000);

            const proccess = (event, args) => {
                let data = args.data;
                switch (data.command) {
                    case "DISCONNECT_TARGET":
                        if (data.status === 'OK') {
                            resolve(); // Resuelve la promesa cuando la escritura es exitosa
                        }
                        else {
                            reject('Error al desconectar'); // Rechaza la promesa en caso de error
                        }
                        break;
                    default:
                        break;
                }
            };

            ipcRenderer.once('CONTROLLER_RESULT_PROGRAMMER', proccess);
        });

        // Toast.promise espera que la promesa se complete (resuelta o rechazada) antes de mostrar el mensaje.
        toast.promise(
            disconnectPromise,
            {
                pending: 'Desconectando...',
                success: 'Desconectado',
                error: 'Error al desconectar'
            },
            Programmer.toastProperties
        );
    }

    reset() {
        if (!this.state.targetConnected)
            return;

        this.sendToMicroProgrammer("RESET");
    }

    halt() {
        if (!this.state.targetConnected || this.state.paused)
            return;

        this.sendToMicroProgrammer("HALT");
    }


    resume() {
        if (!this.state.targetConnected || !this.state.paused)
            return;

        this.sendToMicroProgrammer("RESUME");
    }

    render() {
        return (
            <div className='col-3'>
                <div className='programmer card'>
                    <h4 className='card-header text-center'>Programador</h4>
                    <div className='card-body'>
                        <div className='stlink'>
                            <h5 className='card-title text-center'>STLink</h5>
                            <div className='d-flex justify-content-between'>
                                <span className='text-secondary'>Nº de serie:</span>
                                <input type="text" className='col-7 text-secondary-emphasis' value={this.state.serialNumber} disabled />
                            </div>
                        </div>
                        <hr />
                        <div className='microcontrolador'>
                            <h5 className='card-title text-center'>Microcontrolador</h5>
                            <div className='d-flex justify-content-between'>
                                <span className='card-text text-secondary'>
                                    {
                                        this.state.targetConnected ?
                                            <span className='online'>● Conectado</span> :
                                            <span className='offline'>● Desconectado</span>
                                    }
                                </span>
                                {
                                    this.state.targetConnected ?
                                        <label
                                            className='offline'
                                            onClick={this.disableConnection}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FaPowerOff className="icon mx-1" />
                                            Desconectar
                                        </label>
                                        :
                                        <label
                                            className={this.state.probeConnected ? 'online' : 'disabled'}
                                            onClick={this.toggleConexion}
                                            style={{ cursor: this.state.probeConnected ? 'pointer' : 'not-allowed' }}
                                        >
                                            <FaPowerOff className="icon mx-1" />
                                            Conectar
                                        </label>
                                }
                            </div>
                            <div className='d-flex justify-content-between'>
                                <span className='card-text text-secondary'>Modelo:</span>
                                <span className='card-text text-secondary-emphasis'>{this.state.devName + ' ' + this.state.revName}</span>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <span className='card-text text-secondary'>Versión de firmware:</span>
                                <FileInput targetConnected={this.state.targetConnected} parentCallback={this.updateFile} />
                            </div>
                            <div className='btn-record d-flex justify-content-end'>
                                <button type="button" className='btn btn-warning' onClick={this.programElf}>Grabar</button>
                            </div>
                        </div>
                        <div className='container action-buttons d-flex justify-content-between flex-md-row flex-column'>
                            <button
                                type="button"
                                className='btn btn-primary'
                                disabled={(!this.state.targetConnected)}
                                onClick={this.reset}>
                                Reiniciar
                            </button>
                            <button
                                type="button"
                                className='btn btn-danger'
                                disabled={(!this.state.targetConnected || this.state.paused)}
                                onClick={this.halt}>
                                Pausar
                            </button>
                            <button
                                type="button"
                                className='btn btn-success'
                                disabled={(!this.state.targetConnected || !this.state.paused)}
                                onClick={this.resume}>
                                Reaunudar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Programmer