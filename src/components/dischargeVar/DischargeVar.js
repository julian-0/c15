import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
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
        };
        this.intervalId = null;
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
            if (!this.props.targetReadable) return;
            this.monitorVariables();
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Limpia el intervalo cuando el componente se desmonta
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT');
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

        this.setState({
            led_azul: this.findVariableValueByName('led_azul', response.data),
            led_rojo: this.findVariableValueByName('led_rojo', response.data),
            led_verde: this.findVariableValueByName('led_verde', response.data)
        });
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
        return (
            <div>
                <div className='card'>
                    <div className='card-body'>
                        <div>
                            <button type="button" className='btn btn-primary' onClick={() => this.prenderLed('led_azul')}>led_azul</button>
                        </div>
                        <div>
                            <button type="button" className='btn btn-danger' onClick={() => this.prenderLed('led_rojo')}>led_rojo</button>
                        </div>
                    </div>
                </div>
                <div className='card'>
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
                        <label htmlFor="targetReadable">Estado del Programador:</label>
                        <input name='targetReadable' type='text' value={targetReadable ? 'true' : 'false'} readOnly />
                    </div>
                </div>
            </div>
        )
    }
}

export default DischargeVar