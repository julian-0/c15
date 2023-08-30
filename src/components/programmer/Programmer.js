import React, { Component, useState } from 'react'
import './Programmer.css'
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
            connected: false,
            serialNumber: '--',
            firmwareRevision: '--',
            revName: '--',
            devName: '--',
            eflPath: undefined
        };
        this.getData = this.getData.bind(this);
        this.programEfl = this.programEfl.bind(this);
        this.updateFile = this.updateFile.bind(this);
    }

    componentDidMount() {
        // 3. Setup listener for controller python output (bounced from main process)
        ipcRenderer.on('CONTROLLER_RESULT', (event, args) => {
            console.log(args)
            let data = args.data;
            switch (data.command) {
                case "GET_DATA":
                    this.processGetDataResult(data);
                    break;
                case "PROGRAM":
                    this.processProgramResult(data);
                    break;
                default:
                    console.log("Unknown command: " + data.command);
            }
        });
        this.getData();
    }

    componentWillUnmount() {
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT');
    }

    processGetDataResult(response) {
        if (response.status === 'ERROR') {
            toast.error('Error conectandose al micro', Programmer.toastProperties)
            return;
        }

        let data = response.data;
        this.setState({
            connected: true,
            serialNumber: data.stlink.serial_number,
            firmwareRevision: data.stlink.firmware_revision,
            revName: data.revision.name,
            devName: data.device.name
        });
        toast.success('Conectado al programador', Programmer.toastProperties);
    }

    processProgramResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error programando el .efl', Programmer.toastProperties)
            return;
        }
        toast.success('Programa cargado correctamente', Programmer.toastProperties);
    }

    getData() {
        // 6. Sending data to controller (process already running)
        console.log("Controller data sent")
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "GET_DATA"
            }
        );
    }

    programEfl() {
        if (!this.state.eflPath || this.state.eflPath === '')
            return;
        console.log("Programing efl")
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "PROGRAM",
                path: this.state.eflPath
            }
        );
    }

    updateFile(eflPath) {
        this.setState({ eflPath: eflPath });
    }

    render() {
        return (
            <div className='programmer card col-md-4'>
                <h4 className='card-header text-center'>Programador</h4>
                <div className='card-body'>
                    <div className='d-flex justify-content-between'>
                        <span className='card-text text-secondary'>
                            {
                                this.state.connected ?
                                    <span className='online'>● Conectado</span> :
                                    <span className='offline'>● Desconectado</span>
                            }

                        </span>
                        <span>Desconectar</span>
                    </div>
                    <hr />
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
                            <span className='card-text text-secondary'>Modelo:</span>
                            <span className='card-text text-secondary-emphasis'>{this.state.devName + ' ' + this.state.revName}</span>
                        </div>
                        <div className='d-flex justify-content-between'>
                            <span className='card-text text-secondary'>Versión de firmware:</span>
                            <FileInput parentCallback={this.updateFile} />
                        </div>
                        <div className='btn-record d-flex justify-content-end'>
                            <button type="button" className='btn btn-warning' onClick={this.programEfl}>Grabar</button>
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