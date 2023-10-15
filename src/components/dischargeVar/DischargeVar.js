import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
import './DischargeVar.css';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;

export class DischargeVar extends MicroConnected {

    constructor(props) {
        super(props);
        this.state = {
            targetReadable: props.targetReadable,
            oldChargeStatus: undefined,
            loadingStartTime: undefined,
            loadingTime: undefined,
            variables: []
        };
        this.intervalId = null;
        this.variableNames = [
            'paddleType',
            'paddlePressedButtons',
            'vcap',
            'chargeStatus',
            'temperature',
            'selector',
            'tension',
            'networkState',
            'b1Present',
            'b1State',
            'b1Charge',
            'b2Present',
            'b2State',
            'b2Charge'
        ];
        this.variablesInfo = [
            { name: 'paddleType', pointer: 'tipo_paletas_ptr', size: 1, type: 'char' },
            { name: 'paddlePressedButtons', pointer: 'teclas_presionadas_ptr', size: 1, type: 'bits' },
            { name: 'shock', pointer: 'tecla_shock_ptr', size: 1, type: 'char' },
            { name: 'vcap', pointer: 'vcap_ptr', size: 4, type: 'float' },
            { name: 'chargeStatus', pointer: 'estado_descarga_ptr', size: 1, type: 'char' },//esto tengo que leer la variable estado y monitorear sus cambios
            { name: 'temperature', pointer: 'temperatura_ptr', size: 4, type: 'float' },
            { name: 'selector', pointer: 'estado_actual_ptr', size: 1, type: 'char' },
            { name: 'tension', pointer: 'tension_pwr_ptr', size: 4, type: 'float' },
            { name: 'networkState', pointer: 'red_presente_ptr', size: 1, type: 'char' },
            { name: 'b1Present', pointer: 'presente_bat1_ptr', size: 1, type: 'char' },
            { name: 'b1State', pointer: 'cargando_bat1_ptr', size: 1, type: 'char' },
            { name: 'b1Charge', pointer: 'carga_bat1_ptr', size: 1, type: 'char' },
            { name: 'b2Present', pointer: 'presente_bat2_ptr', size: 1, type: 'char' },
            { name: 'b2State', pointer: 'cargando_bat2_ptr', size: 1, type: 'char' },
            { name: 'b2Charge', pointer: 'carga_bat2_ptr', size: 1, type: 'char' }
        ];
    }

    componentDidMount() {
        // 3. Setup listener for controller python output (bounced from main process)
        ipcRenderer.on('CONTROLLER_RESULT_VARIABLES', (event, args) => {
            let data = args.data;
            switch (data.command) {
                case "PRENDER":
                    this.processPrenderResult(data);
                    break;
                case "MONITOR":
                    this.processMonitorResult(data);
                    break;
                default:
                    console.log("Unknown command: " + data.command);
            }
        });
        this.intervalId = setInterval(() => {
            if (!this.props.targetReadable) {
                if (this.state.paddleType !== undefined)
                    this.clearVariables();
                return;
            }
            this.monitorVariables();
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Limpia el intervalo cuando el componente se desmonta
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_VARIABLES');
    }

    sendToMicroVariables(command, body) {
        this.sendToMicro(command, 'VARIABLES', body);
    }

    monitorVariables() {
        this.sendToMicroVariables("MONITOR", {
            variables: this.variablesInfo
        });
    }

    processMonitorResult(response) {
        if (response.status !== 'OK')
            return;

        this.setState({ oldChargeStatus: this.state.chargeStatus });
        this.setVariables(response.data)
        this.updateDeviceStatus();
    }

    setVariables(data) {
        const newState = {};
        this.variablesInfo.forEach(v => {
            newState[v.name] = this.findVariableValueByName(v.name, data);
        });
        this.setState(newState);
    }

    clearVariables() {
        const newState = {};
        this.variablesInfo.forEach(v => {
            newState[v.name] = undefined;
        });
        this.setState(newState);
    }

    findVariableValueByName(name, variables) {
        return variables.find(variable => variable.name === name).value;
    }

    processPrenderResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error prendiendo led', DischargeVar.toastProperties)
            return;
        }
        toast.success('led prendido', DischargeVar.toastProperties);
    }

    prenderLed(led) {
        this.sendToMicroVariables("PRENDER", { variable: led });
    }

    renderPaddleType(paddleType) {
        switch (paddleType) {
            case 0:
                return 'Parches'
            case 1:
                return 'Paletas externas'
            case 2:
                return 'Paletas internas'
            case 3:
                return 'Desconectadas'
            default:
                return '--'
        }
    }

    isBatteryPresent(bt) {
        if (bt !== undefined) {
            if (bt === 1)
                return 'Sí';
            else
                return 'No';
        }
        return '--';
    }

    parseBatteryState(state) {
        if (state !== undefined) {
            switch (state) {
                case 0:
                    return 'Stand by';
                case 1:
                    return 'Cargando';
                default:
                    return '--';
            }
        }
        return '--';
    }

    updateDeviceStatus() {
        const { oldChargeStatus, chargeStatus, loadingStartTime } = this.state;

        switch (chargeStatus) {
            case 2: // Cargando
                if (oldChargeStatus === 1) {
                    this.setState({ loadingStartTime: Date.now() });
                }
                break;
            case 3: // Cargado
                if (oldChargeStatus === 2) {
                    this.setState({ loadingTime: Date.now() - loadingStartTime });
                }
                break;
            // Agregar más casos según tus necesidades
        }
    }

    render() {
        const { targetReadable } = this.props;
        const paddleType = this.state.paddleType !== undefined ? this.state.paddleType : '--';
        const paddlePressedButtons = this.state.paddlePressedButtons;
        const shock = this.state.shock;
        const registerPressed = paddlePressedButtons ? paddlePressedButtons.charAt(7) : '0';
        const shockPressed = paddlePressedButtons ? paddlePressedButtons.charAt(6) : '0';
        const chargePressed = paddlePressedButtons ? paddlePressedButtons.charAt(5) : '0';
        const vcap = this.state.vcap ? Math.trunc(this.state.vcap) + ' V' : '--';
        const loadingTime = this.state.loadingTime ? (this.state.loadingTime / 1000).toFixed(2) + ' seg' : '--';
        const temperature = this.state.temperature ? this.state.temperature.toFixed(2) + ' ºC' : '--';
        const selector = this.state.selector;
        const tension = this.state.tension ? this.state.tension.toFixed(2) + ' V' : '--';
        const networkState = this.state.networkState;
        const b1Present = this.state.b1Present;
        const b1State = this.state.b1State;
        const b1Charge = this.state.b1Charge;
        const b2Present = this.state.b2Present;
        const b2State = this.state.b2State;
        const b2Charge = this.state.b2Charge;


        return (
            <div className='col'>
                <div className='container d-flex justify-content-around my-3'>
                    <div className='card col-5'>
                        <h4 className='card-header text-center'>Paletas</h4>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between'>
                                <p className='card-text text-secondary'>Tipo</p>
                                <p className='card-text text-secondary-emphasis'>{this.renderPaddleType(paddleType)}</p>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Teclas</h5>
                                <div className='col align-items-center d-flex justify-content-between'>
                                    <p className={`px-1 mb-0 card-text text-secondary-emphasis option ${shockPressed === '1' ? 'selected' : ''}`} >
                                        Shock
                                    </p>
                                    <p className={`px-1 mb-0 card-text text-secondary-emphasis option ${chargePressed === '1' ? 'selected' : ''}`} >
                                        Carga
                                    </p>
                                    <p className={`px-1 mb-0 card-text text-secondary-emphasis option ${registerPressed === '1' ? 'selected' : ''}`} >
                                        Registro
                                    </p>
                                    <p className={`px-1 mb-0 card-text text-secondary-emphasis option ${shock === 1 ? 'selected' : ''}`} >
                                        Shock frontal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card col-5'>
                        <div className='card-body d-flex flex-column justify-content-end'>
                            <div className="col d-flex flex-column justify-content-between">
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>VCAP</p>
                                    <p className='card-text text-secondary-emphasis'>{vcap}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de carga</p>
                                    <p className='card-text text-secondary-emphasis'>{loadingTime}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Temperatura</p>
                                    <p className='card-text text-secondary-emphasis'>{temperature}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='container d-flex justify-content-around my-3'>
                    <div className='card col-5'>
                        <h4 className='card-header text-center'>Selectora</h4>
                        <div className='card-body d-flex flex-column align-items-center'>
                            <div className='col d-flex flex-column justify-content-around'>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 1 ? 'selected' : ''}`} >
                                        DEA
                                    </p>
                                </div>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 0 ? 'selected' : ''}`} >
                                        Apagado
                                    </p>
                                </div>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 2 ? 'selected' : ''}`} >
                                        Monitor
                                    </p>
                                </div>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 3 ? 'selected' : ''}`} >
                                        Desfibrilador Manual
                                    </p>
                                </div>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 4 ? 'selected' : ''}`} >
                                        Marcapasos
                                    </p>
                                </div>
                                <div className='row'>
                                    <p className={`card-text text-secondary-emphasis option ${selector === 5 ? 'selected' : ''}`} >
                                        Error
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card col-5'>
                        <h4 className='card-header text-center'>Alimentación</h4>
                        <div className='card-body'>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tensión</p>
                                    <p className='card-text text-secondary-emphasis'>{tension}</p>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Red</h5>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Estado</p>
                                    {
                                        networkState === 1 ?
                                            <p className='online' >Conectado </p>
                                            :
                                            <p className='offline'> Desconectado </p>
                                    }
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Bateria 1</h5>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Presente</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Estado</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Carga</p>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{this.isBatteryPresent(b1Present)}</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{this.parseBatteryState(b1State)}</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{b1Charge ? b1Charge + '%' : '--'}</p>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Bateria 2</h5>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Presente</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Estado</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Carga</p>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{this.isBatteryPresent(b2Present)}</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{this.parseBatteryState(b2State)}</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary-emphasis'>{b2Charge ? b2Charge + '%' : '--'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DischargeVar