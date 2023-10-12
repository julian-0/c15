import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
//import './EcgVar.css';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;

export class EcgVar extends MicroConnected {

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
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_VARIABLES');
    }

    render() {
        const { targetReadable } = this.props;
        return (
            <div className='col ecgvar'>
                <div className='row justify-content-around'>
                    <div className='col-5'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Impedancia</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Valor</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='row mt-auto'>
                                    <div className='col'>
                                        <button
                                            type="button"
                                            className='btn btn-primary'
                                        //disabled={(!this.state.targetConnected)}
                                        //onClick={this.reset}
                                        >
                                            Calibrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Estado</h6>
                            <div className='card-body col'>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Frecuencia cardiaca</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>Insto</p>
                                </div>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Derivación</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>RA</p>
                                </div>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Amplitud</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>LA</p>
                                </div>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Cant electrodos</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>LL</p>
                                </div>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Filtro de linea</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>V</p>
                                </div>
                                <div className='row'>
                                    <p className='col card-text text-secondary'>Estado DEA</p>
                                    <p className='col card-text text-secondary-emphasis'>valor</p>
                                    <p className='col card-text text-secondary-emphasis'>RL</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default EcgVar