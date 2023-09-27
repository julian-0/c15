import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;

export class CpuVar extends MicroConnected {

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
            <div className='col'>
                <div className='row'>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h4 className='card-header text-center'>General</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Modelo</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Fecha y hora</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h4 className='card-header text-center'>Pantalla</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Idioma</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Velocidad</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h4 className='card-header text-center'>Registrador</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Grilla</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Velocidad</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h4 className='card-header text-center'>Desfibrilador manual</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Energia paletas ext</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Energia paletas int</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Derivacion</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h4 className='card-header text-center'>Marcapasos</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Modo</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Frecuencia</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Amplitud</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h4 className='card-header text-center'>SpO2</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Saturometro</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <hr />
                                <div>
                                    <h5 className='card-title text-center'>Alarma set 1</h5>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>BPM</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>Saturación</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                </div>
                                <hr />
                                <div>
                                    <h5 className='card-title text-center'>Alarma set 2</h5>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>BPM</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>Saturación</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h4 className='card-header text-center'>Audio</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Modo</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Frecuencia</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h4 className='card-header text-center'>ECG</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Cant Electrodos</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Derivación</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Amplitud</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Filtro de linea</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <hr />
                                <div>
                                    <h5 className='card-title text-center'>Alarma set 1</h5>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>BPM</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>Saturación</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                </div>
                                <hr />
                                <div>
                                    <h5 className='card-title text-center'>Alarma set 2</h5>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>BPM</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary-emphasis'>Saturación</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Alta</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className='card-text text-secondary'>Baja</span>
                                        <span className='card-text text-secondary-emphasis'>valor</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h4 className='card-header text-center'>General</h4>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Energía 1</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Energía 2</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Energía 3</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Intervalo de audio</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Pausa inicial</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Tiempo de RCP</span>
                                    <span className='card-text text-secondary-emphasis'>valor</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='card-text text-secondary'>Grabación de audio</span>
                                    <input type='checkbox' className='form-check-input' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CpuVar