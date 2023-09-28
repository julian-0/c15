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
            led_azul: undefined,
            led_rojo: undefined,
            led_verde: undefined,
            targetReadable: props.targetReadable,
            variables: []
        };
        this.intervalId = null;
        this.variableNames = [
            'paddleType',
            'paddleSwitch',
            'vcap',
            'chargeTime',
            'temperature',
            'mainSwitch',
            'tension',
            'networkState',
            'b1Present',
            'b1State',
            'b1Charge',
            'b2Present',
            'b2State',
            'b2Charge',
            'led_azul',
            'led_rojo',
            'led_verde'
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
            variables: ["led_azul", "led_rojo", "led_verde"]
        });
    }

    processMonitorResult(response) {
        if (response.status !== 'OK')
            return;
        let data = response.data;
        data.push(
            { name: 'paddleType', value: 'Externa' },
            { name: 'paddleSwitch', value: 'Shock' },
            { name: 'vcap', value: '1111' },
            { name: 'chargeTime', value: '10' },
            { name: 'temperature', value: '10º' },
            { name: 'mainSwitch', value: 'DEA' },
            { name: 'tension', value: '10' },
            { name: 'paddleSwitch', value: 'Shock' },
            { name: 'networkState', value: 'Connected' },
            { name: 'battery1State', value: 'Presente' },
            { name: 'battery2State', value: 'Shock' },
            { name: 'b1Present', value: 'Sí'},
            { name: 'b1State', value: 'Bueno'},
            { name: 'b1Charge', value: '100'},
            { name: 'b2Present', value: 'No'},
            { name: 'b2State', value: 'Malo'},
            { name: 'b2Charge', value: '0'});
        this.setVariables(response.data)
    }

    setVariables(data) {
        const newState = {};
        this.variableNames.forEach(name => {
            newState[name] = this.findVariableValueByName(name, data);
        });
        this.setState(newState);
    }

    clearVariables() {
        const newState = {};
        this.variableNames.forEach(name => {
            newState[name] = undefined;
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

    render() {
        const { targetReadable } = this.props;
        const paddleType = this.state.paddleType ? this.state.paddleType : '--';
        const paddleSwitch = this.state.paddleSwitch;
        const vcap = this.state.vcap ? this.state.vcap : '--';
        const chargeTime = this.state.chargeTime ? this.state.chargeTime : '--';
        const temperature = this.state.temperature ? this.state.temperature : '--';
        const mainSwitch = this.state.mainSwitch;
        const tension = this.state.tension ? this.state.tension : '--';
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
                                <p className='card-text text-secondary-emphasis'>{paddleType}</p>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Teclas</h5>
                                <div className='d-flex justify-content-between'>
                                    <p className={`card-text text-secondary-emphasis option ${paddleSwitch === 'Shock' ? 'selected' : ''}`} >
                                        Shock
                                    </p>
                                    <p className={`card-text text-secondary-emphasis option ${paddleSwitch === 'Carga' ? 'selected' : ''}`} >
                                        Carga
                                    </p>
                                    <p className={`card-text text-secondary-emphasis option ${paddleSwitch === 'Registro' ? 'selected' : ''}`} >
                                        Registro
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card col-5'>
                        <div className='card-body'>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>VCAP</p>
                                    <p className='card-text text-secondary-emphasis'>{vcap}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de carga</p>
                                    <p className='card-text text-secondary-emphasis'>{chargeTime}</p>
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
                        <div className='card-body'>
                            <div className='col'>
                                <p className={`card-text text-secondary-emphasis option ${mainSwitch === 'DEA' ? 'selected' : ''}`} >
                                    DEA
                                </p>
                                <p className={`card-text text-secondary-emphasis option ${mainSwitch === 'Apagado' ? 'selected' : ''}`} >
                                    Apagado
                                </p>
                                <p className={`card-text text-secondary-emphasis option ${mainSwitch === 'Registro' ? 'selected' : ''}`} >
                                    Monitor
                                </p>
                                <p className={`card-text text-secondary-emphasis option ${mainSwitch === 'Desfibrilador Manual' ? 'selected' : ''}`} >
                                    Desfibrilador Manual
                                </p>
                                <p className={`card-text text-secondary-emphasis option ${mainSwitch === 'Marcapasos' ? 'selected' : ''}`} >
                                    Marcapasos
                                </p>
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
                                        networkState === 'Connected' ?
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
                                    <p className='card-text text-secondary'>Presente</p>
                                    <p className='card-text text-secondary'>Estado</p>
                                    <p className='card-text text-secondary'>Carga</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary-emphasis'>{b1Present}</p>
                                    <p className='card-text text-secondary-emphasis'>{b1State}</p>
                                    <p className='card-text text-secondary-emphasis'>{b1Charge?b1Charge+'%':b1Charge}</p>
                                </div>
                            </div>
                            <hr />
                            <div>
                                <h5 className='card-title text-center'>Bateria 2</h5>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Presente</p>
                                    <p className='card-text text-secondary'>Estado</p>
                                    <p className='card-text text-secondary'>Carga</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary-emphasis'>{b2Present}</p>
                                    <p className='card-text text-secondary-emphasis'>{b2State}</p>
                                    <p className='card-text text-secondary-emphasis'>{b2Charge?b2Charge+'%':b2Charge}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='card' >
                        <div className='card-body'>
                            <div>
                                <button type="button" className='btn btn-primary' onClick={() => this.prenderLed('led_azul')}>led_azul</button>
                            </div>
                            <div>
                                <button type="button" className='btn btn-danger' onClick={() => this.prenderLed('led_rojo')}>led_rojo</button>
                            </div>
                        </div>
                    </div>
                    <div className='card' >
                        <div className='card-body'>
                            <div>
                                <label htmlFor="led_azul">led_azul</label>
                                <input name='led_azul' type="text" value={this.state.led_azul} readOnly />
                            </div>
                            <div>
                                <label htmlFor="led_rojo">led_rojo</label>
                                <input name='led_rojo' type="text" value={this.state.led_rojo} readOnly />
                            </div>
                            <div>
                                <label htmlFor="led_verde">led_verde</label>
                                <input name='led_verde' type="text" value={this.state.led_verde} readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DischargeVar