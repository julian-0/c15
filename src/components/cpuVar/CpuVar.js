import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
import './CpuVar.css';
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
            <div className='col cpuvar'>
                <div className='row'>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>General</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modelo</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fecha y hora</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Pantalla</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Idioma</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Velocidad</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Registrador</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Grilla</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Velocidad</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Desfibrilador manual</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energia paletas ext</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energia paletas int</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Derivacion</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Marcapasos</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modo</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Frecuencia</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Amplitud</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>SpO2</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Saturometro</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 1</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 2</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Audio</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modo</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Frecuencia</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>ECG</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Cant Electrodos</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Derivación</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Amplitud</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Filtro de linea</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 1</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 2</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <p className='card-text text-secondary-emphasis'>valor</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='col-3 my-1 d-flex flex-column'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>General</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 1</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 2</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 3</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Intervalo de audio</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Pausa inicial</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de RCP</p>
                                    <p className='card-text text-secondary-emphasis'>valor</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Grabación de audio</p>
                                    <input type='checkbox' className='form-check-input' />
                                </div>
                            </div>
                        </div>
                        <div className='row mt-auto'>
                            <div className='col'>
                                <button
                                    type="button"
                                    className='btn btn-primary'
                                //disabled={(!this.state.targetConnected)}
                                //onClick={this.reset}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CpuVar