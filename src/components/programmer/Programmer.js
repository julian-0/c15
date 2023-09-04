import React, { Component, useState } from 'react'
import './Programmer.css'
import { FaPowerOff } from 'react-icons/fa';
import FileInput from '../fileInput/FileInput'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;
const loadBalancer = window.require('electron-load-balancer');

class Programmer extends React.Component {

    static toastProperties = {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    constructor(props) {
        super(props);
        this.state = {
            probeConnected: false,
            targetConnected: false,
            serialNumber: '',
            firmwareRevision: '--',
            revName: '--',
            devName: '--',
            elfPath: undefined
        };
        this.intervalId = null;
        this.getData = this.getData.bind(this);
        this.programElf = this.programElf.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.toggleConexion = this.toggleConexion.bind(this);
        this.disableConnection = this.disableConnection.bind(this);
    }

    componentDidMount() {
        // 3. Setup listener for controller python output (bounced from main process)
        ipcRenderer.on('CONTROLLER_RESULT', (event, args) => {
            let data = args.data;
            switch (data.command) {
                case "GET_DATA":
                    this.processGetDataResult(data);
                    break;
                case "PROGRAM":
                    this.processProgramResult(data);
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
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT');
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
            return;
        }
        if (!response.data.target) {
            this.setState({
                targetConnected: false,
                revName: '--',
                devName: '--',
                elfPath: undefined
            });
        }

        if (this.state.probeConnected === false) {
            this.getData();
        }
        this.setState({ probeConnected: true });
    }

    checkConnection() {
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "CONNECTION"
            }
        );
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
        toast.success('Conectado al probe', Programmer.toastProperties);
    }

    processConnectResult(response) {
        if (response.status === 'ERROR') {
            toast.error('Error conectandose al micro', Programmer.toastProperties)
            return;
        }

        let data = response.data;
        this.setState({
            targetConnected: true,
            revName: data.revision.name,
            devName: data.device.name
        });
        toast.success('Conectado al target', Programmer.toastProperties);
    }

    processDisconnectResult(response) {
        if (response.status === 'ERROR') {
            toast.error('Error desconectandose del target', Programmer.toastProperties)
            return;
        }

        this.setState({
            targetConnected: false,
            revName: '--',
            devName: '--'
        });
        toast.success('Desconectado del target', Programmer.toastProperties);
    }

    processProgramResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error programando el .elf', Programmer.toastProperties)
            return;
        }
        toast.success('Programa cargado correctamente', Programmer.toastProperties);
    }

    getData() {
        // 6. Sending data to controller (process already running)
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "GET_DATA"
            }
        );
    }

    programElf() {
        if (!this.state.elfPath || this.state.elfPath === '')
            return;
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "PROGRAM",
                path: this.state.elfPath
            }
        );
    }

    updateFile(elfPath) {
        this.setState({ elfPath: elfPath });
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "SET_ELF_FILE",
                path: elfPath
            }
        );
    }

    toggleConexion() {
        if (this.state.targetConnected) {
            return;
        }
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "CONNECT_TARGET"
            }
        );
    }

    disableConnection() {
        if (!this.state.targetConnected) {
            return;
        }
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "DISCONNECT_TARGET"
            }
        );
    }

    render() {
        return (
            <div className='programmer card col-md-4'>
                <h4 className='card-header text-center'>Programador</h4>
                <div className='card-body'>
                    <div className='stlink'>
                        <h5 className='card-title text-center'>STLink</h5>
                        <div className='d-flex justify-content-between'>
                            <span className='text-secondary'>Número de serie:</span>
                            <input type="text" className='text-secondary-emphasis' value={this.state.serialNumber} disabled />
                        </div>
                        <div className='d-flex justify-content-between'>
                            <span className='card-text text-secondary'>Versión de firmware:</span>
                            <span className='card-text text-secondary-emphasis'>{this.state.firmwareRevision}</span>
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
                                        <FaPowerOff className="icon" />
                                        Desconectar
                                    </label>
                                    :
                                    <label
                                        className={this.state.probeConnected ? 'online' : 'disabled'}
                                        onClick={this.toggleConexion}
                                        style={{ cursor: this.state.probeConnected ? 'pointer' : 'not-allowed' }}
                                    >
                                        <FaPowerOff className="icon" />
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
                        <button type="button" className='btn btn-primary'>Reiniciar</button>
                        <button type="button" className='btn btn-danger'>Pausar</button>
                        <button type="button" className='btn btn-success'>Reaunudar</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Programmer