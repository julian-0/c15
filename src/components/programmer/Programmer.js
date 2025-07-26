import React from 'react'
import './Programmer.css'
import { FaPowerOff } from 'react-icons/fa';
import { BsExclamationTriangle } from 'react-icons/bs';
import FileInput from '../fileInput/FileInput'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
import NumericInput from '../numericInput/NumericInput';
import VersionDefaultModal from '../versionDefaultModal/VersionDefaultModal';
import { withTranslation  } from "react-i18next";

const electron = window.require('electron');
const { ipcRenderer } = electron;

export class Programmer extends MicroConnected {

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
            paused: false,
            versionError: false,
            form: {
                revision: '',
                variant: '',
                rework: '',
                checksum: ''
            }
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
        this.variablesInfo = [
            { name: 'revision', pointer: 'controlConfigRev_ptr', size: 4, type: 'uint' },
            { name: 'variant', pointer: 'controlConfigVar_ptr', size: 4, type: 'uint' },
            { name: 'rework', pointer: 'controlConfigRew_ptr', size: 4, type: 'uint' },
            { name: 'checksum', pointer: 'controlConfigCrc8_ptr', size: 1, type: 'char' }
        ];
        this.defaultForm = {
            revision: '',
            variant: '',
            rework: '',
            checksum: ''
        };

        this.monitorVersion = this.monitorVersion.bind(this);
        this.writeVersion = this.writeVersion.bind(this);
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

        ipcRenderer.on('CONTROLLER_RESULT_VERSION', (event, args) => {
            let data = args.data;
            switch (data.command) {
                case "MONITOR":
                    this.processMonitorResult(data);
                    break;
                default:
                    console.log("Unknown command: " + data.command);
            }
        });
        if(this.props.showVersion)
            this.monitorVersion();
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Limpia el intervalo cuando el componente se desmonta
        if (this.state.targetConnected) {
            this.disableConnection();
        }
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_PROGRAMMER');
        if (this.props.showVersion)
            ipcRenderer.removeAllListeners('CONTROLLER_RESULT_VERSION');
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
                elfPath: undefined,
                form: this.defaultForm,
                versionError: false
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
                elfPath: undefined,
                form: this.defaultForm,
                versionError: false
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
            }, 5 * 60 * 1000);

            const proccess = (event, args) => {
                let data = args.data;
                switch (data.command) {
                    case "PROGRAM":
                        if (data.status === 'OK') {
                            resolve(); // Resuelve la promesa cuando la escritura es exitosa
                            this.monitorVersion();
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
        if (response.status === 'OK'){
            this.props.updateTargetState(true);
            this.monitorVersion();
        }
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

    fillForm = () => {
        this.setState({ form: this.state.defaultForm });
    }

    handleEditModalShow = () => {
        this.setState({ editModalShow: true });
    }

    handleEditModalClose = () => {
        this.setState({ editModalShow: false });
    }

    handleUpdate = (configForm) => {
        this.setState({ defaultForm: configForm });
    }

    handleInputChange = (fieldName, value) => {
        const form = { ...this.state.form, [fieldName]: value };

        this.setState({ form });
    }

    processMonitorResult(response) {
        if (response.status !== 'OK'){
            this.fillForm();
            return;
        }
        this.setVariables(response.data);
        let variables = this.variablesInfo.map(v => {
            let value = this.state.form[v.name];
            value = parseInt(value);
            return { ...v, value };
        });
        variables = variables.slice(0, variables.length - 1);
        let checksum = this.calculateChecksum(variables);
        if(checksum !== this.state.form.checksum){
            this.setState({ versionError: true });
        }
        else
            this.setState({ versionError: false });
    }

    findVariableValueByName(name, variables) {
        const value = variables.find(variable => variable.name === name).value;
        return value === null ? '' : value;
    }

    setVariables(data) {
        const newState = {};
        this.variablesInfo.forEach(v => {
            newState[v.name] = this.findVariableValueByName(v.name, data);
        });
        this.setState({ form: newState });
    }

    sendToMicroVersion(command, body) {
        this.sendToMicro(command, 'VERSION', body);
    }

    monitorVersion() {
        this.sendToMicroVersion("MONITOR", {
            variables: this.variablesInfo
        });
    }

    calculateChecksum(variablesInfo) {
        let checksum = 0xA5; // Valor inicial para evitar 0xFF en caso de todos 0xFF
        
        let buffer = [];
        let varTotalSize = 0;
        
        // Recorrer cada variable y extraer sus bytes en formato little-endian
        variablesInfo.forEach(variable => {
            let value = variable.value;
            for (let i = 0; i < variable.size; i++) {
                buffer.push((value >> (8 * i)) & 0xFF);
            }
            varTotalSize += variable.size;
        });

        // Rellenar con 0xFF hasta completar los 64 bytes de la estructura completa
        let reservedSize = 64 - varTotalSize -1; // 1 byte de checksum
        buffer = buffer.concat(new Array(reservedSize).fill(0xFF));
        
        // Aplicar la operación XOR a todos los bytes
        for (let i = 0; i < buffer.length; i++) {
            checksum ^= buffer[i];
        }
        
        return checksum;
    }

    writeVersion() {
        const form = this.state.form;

        //obtain a copy of the variablesInfo array withouth the checksum
        let variablesInfo2 = this.variablesInfo.slice(0, this.variablesInfo.length - 1);

        //add to variablesInfo the value propertie from the corresonding form value, if the value is boolean replace with 1 or 0
        const variables = variablesInfo2.map(v => {
            let value = form[v.name];
            if (typeof value == "boolean") {
                value = value ? 1 : 0;
            }
            else {
                value = parseInt(value);
            }
            return { ...v, value };
        });

        variables.push({ name: 'checksum', pointer: 'controlConfigCrc8_ptr', size: 1, type: 'char', value: this.calculateChecksum(variables) });
        this.sendToMicroVersion("WRITE_FLASH", {
            variables: variables,
            direct: false
        });

        const calibrationPromise = new Promise((resolve, reject) => {

            const proccess = (event, args) => {
                let data = args.data;
                switch (data.command) {
                    case "WRITE_FLASH":
                        ipcRenderer.removeListener('CONTROLLER_RESULT_VERSION', proccess);
                        if (data.status === 'OK') {
                            
                            if(!this.allValuesAreEquals(data.data.variables)){
                                reject('Error al escribir');
                            }
                            else                            
                                resolve();

                            this.monitorVersion();
                        }
                        else {
                            reject('Error al escribir');
                        }
                        break;
                    default:
                        break;
                }
            };

            ipcRenderer.on('CONTROLLER_RESULT_VERSION', proccess);
        });

        toast.promise(
            calibrationPromise,
            {
                pending: 'Escribiendo valores',
                success: 'Escritura realizada con éxito',
                error: 'Error al escribir'
            },
            Programmer.toastProperties
        );
    }

    allValuesAreEquals(variables){
        const form = this.state.form;
        let equals = true;
        let variablesWithoutCrc = variables.slice(0, variables.length - 1);
        variablesWithoutCrc.forEach(v => {
            let originalValue = form[v.name];
            equals = originalValue === v.value;
        });
        return equals;
    }

    render() {
        const { targetReadable } = this.props;
        const form = this.state.form;
        const { versionError } = this.state;
        const { t } = this.props;
        return (
            <div className='col-3'>
                <div className='programmer card'>
                    <h4 className='card-header text-center'>{t("programer")}</h4>
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
                {this.props.showVersion &&
                    <div>
                        <div className='mt-3 programmer card'>
                            <h4 className='card-header'>Versión del hardware</h4>
                            <div className='card-body'>
                                <div>
                                    <div className='d-flex justify-content-between'>
                                        <div className='col'>
                                            <p className='card-text text-secondary'>Revisión PCB</p>
                                        </div>
                                        <div className='col'>
                                            <p className='card-text text-secondary'>Variante</p>
                                        </div>
                                        <div className='col'>
                                            <p className='card-text text-secondary'>Rework</p>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <div className='col'>
                                            <NumericInput disabled={!targetReadable}
                                                min={0}
                                                value={form.revision}
                                                onChange={(value) => this.handleInputChange('revision', value)}
                                                className="col-10" />
                                        </div>
                                        <div className='col'>
                                            <NumericInput disabled={!targetReadable}
                                                min={0}
                                                value={form.variant}
                                                onChange={(value) => this.handleInputChange('variant', value)}
                                                className="col-10" />
                                        </div>
                                        <div className='col'>
                                            <NumericInput disabled={!targetReadable}
                                                min={0}
                                                value={form.rework}
                                                onChange={(value) => this.handleInputChange('rework', value)}
                                                className="col-10" />
                                        </div>
                                    </div>
                                </div>
                                <div className='container action-buttons d-flex justify-content-around flex-md-row flex-column'>
                                    <div className='col-6 border py-2 mx-1 rounded'>
                                        <div>
                                            <p className='card-text text-secondary'>Valores default</p>
                                        </div>
                                        <div className='d-flex justify-content-around'>
                                            <button
                                                type="button"
                                                className='btn btn-outline-primary'
                                                disabled={!this.state.targetConnected}
                                                onClick={this.fillForm}>
                                                Escribir
                                            </button>
                                            <button
                                                type="button"
                                                className='btn btn-outline-primary'
                                                onClick={this.handleEditModalShow}>
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                    <div className='col align-self-end py-2'>
                                        <button
                                            type="button"
                                            className='btn btn-primary'
                                            disabled={!targetReadable}
                                            onClick={this.monitorVersion}>
                                            Leer
                                        </button>
                                    </div>
                                    <div className='col align-self-end py-2'>
                                        <button
                                            type="button"
                                            className='btn btn-success'
                                            disabled={!targetReadable}
                                            onClick={this.writeVersion}>
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                                {versionError &&
                                    <div className='versionError'>
                                        <BsExclamationTriangle /> 
                                        <p className='card-text'>Versión de hardware errónea o vacía. Escribir luego de grabar el firmware</p>
                                    </div>
                                }
                            </div>
                        </div>
                        <VersionDefaultModal
                            show={this.state.editModalShow}
                            handleClose={this.handleEditModalClose}
                            onUpdate={this.handleUpdate}
                        />
                    </div>
                }
            </div>

        )
    }
}

export default withTranslation()(Programmer);