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
            actualDateCheck: false,
            inputDate: undefined,
            targetReadable: props.targetReadable,
        };

        this.frecuencyOptions = [];
        for (let i = 30; i <= 180; i += 10) {
            this.frecuencyOptions.push(i);
        }

        this.amplitudOptions = [];
        for (let i = 10; i <= 200; i += 10) {
            this.amplitudOptions.push(i);
        }

        this.intenalEnergyOptions = [
            { value: 0, label: '1J' },
            { value: 1, label: '2J' },
            { value: 2, label: '3J' },
            { value: 3, label: '4J' },
            { value: 4, label: '5J' },
            { value: 5, label: '6J' },
            { value: 6, label: '7J' },
            { value: 7, label: '8J' },
            { value: 8, label: '9J' },
            { value: 9, label: '10J' },
            { value: 10, label: '15J' },
            { value: 11, label: '20J' },
            { value: 12, label: '30J' },
            { value: 13, label: '50J' }
        ];

        this.energyOptions = [
            ...this.intenalEnergyOptions,
            { value: 14, label: '75J' },
            { value: 15, label: '100J' },
            { value: 16, label: '150J' },
            { value: 17, label: '200J' },
            { value: 18, label: '300J' },
            { value: 19, label: '360J' }
        ];

        this.variablesInfo = [
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
    }

    componentWillUnmount() {
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_VARIABLES');
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.actualDateCheck !== prevState.actualDateCheck && this.state.actualDateCheck) {
            this.setState({ inputDate: '' });
        }
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

        this.setVariables(response.data)
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

    writeVariables() {
        this.sendToMicroVariables("WRITE_FLASH", {
            pointer: "cte_calibracion_imp",
            size: 4,
            value: 1
        });
    }

    processWriteResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error al calibrar');
            return;
        }

        toast.success('Calibración realizada con éxito');
    }

    validateOnlyNumbers(event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    }

    render() {
        const { targetReadable } = this.props;
        const actualDateCheck = this.state.actualDateCheck;
        const inputDate = this.state.inputDate;

        return (
            <div className='col cpuvar'>
                <div className='row'>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>General</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modelo</p>
                                    <select aria-label="Modelo select">
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fecha y hora</p>
                                    <div>
                                        <label for='date-check' className='mx-1'>Actual</label>
                                        <input
                                            id='date-check'
                                            type='checkbox'
                                            className='form-check-input'
                                            checked={actualDateCheck}
                                            onChange={() => {
                                                if (actualDateCheck) {
                                                    //setText('')
                                                    this.setState({ inputDate: '' })
                                                }
                                                this.setState({ actualDateCheck: !actualDateCheck });
                                            }
                                            }
                                        />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <input
                                        id='date'
                                        type="datetime-local"
                                        value={inputDate}
                                        className='text-secondary-emphasis'
                                        disabled={actualDateCheck}
                                        onChange={e => this.setState({ inputDate: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Pantalla</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Idioma</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">Español</option>
                                        <option value="1">Inglés</option>
                                        <option value="2">Portugués</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Velocidad</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">12,5 mm/s</option>
                                        <option value="1" selected>25 mm/s</option>
                                        <option value="2">50 mm/s</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Registrador</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Grilla</p>
                                    <input type='checkbox' className='form-check-input' />
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fuente</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">ECG</option>
                                        <option value="1">SpO2</option>
                                        <option value="2">ECG+SpO2</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Desfibrilador manual</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary-emphasis'>Energía paletas</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Externas</p>
                                    <select aria-label="Modelo select">
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Internas</p>
                                    <select aria-label="Modelo select">
                                        {this.intenalEnergyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>SpO2</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Saturómetro</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <select aria-label="Modelo select">
                                        <option value="0">Apexar BAT100</option>
                                        <option value="1" disabled>UNICARE UN02</option>
                                    </select>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 1</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <input type="number" min='30' max='255' className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='30' max='255' className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <input type="number" min='80' max="100" className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='80' max="100" className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
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
                                        <input type="number" min='30' max='255' className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='30' max='255' className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <input type="number" min='80' max="100" className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='80' max="100" className='col-4 text-secondary-emphasis' onKeyPress={this.validateOnlyNumbers} />
                                    </div>
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
                                    <select aria-label="Modelo select">
                                        <option value="3">3 hilos</option>
                                        <option value="5">5 hilos</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Derivación</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">DI</option>
                                        <option value="1">DII</option>
                                        <option value="2">DIII</option>
                                        <option value="3">aVR</option>
                                        <option value="4">aVL</option>
                                        <option value="5">aVF</option>
                                        <option value="6">V</option>
                                        <option value="100">Paletas</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Amplitud</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">x0.25</option>
                                        <option value="1">x0.5</option>
                                        <option value="2">x1</option>
                                        <option value="3">x2</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Filtro de linea</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <select aria-label="Modelo select">
                                        <option value="0">Desactivado</option>
                                        <option value="1">50 Hz</option>
                                        <option value="2">60 Hz</option>
                                    </select>
                                </div>
                                <hr />
                                <div>
                                    <h6 className='card-title text-center'>Alarma set 1</h6>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>BPM</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <input type="number" min='20' max='250' className='col-4 text-secondary-emphasis' />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='20' max='250' className='col-4 text-secondary-emphasis' />
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
                                        <input type="number" min='20' max='250' className='col-4 text-secondary-emphasis' />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <input type="number" min='20' max='250' className='col-4 text-secondary-emphasis' />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='col-3 my-1 d-flex flex-column'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>DEA</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 1</p>
                                    <select aria-label="Modelo select">
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 2</p>
                                    <select aria-label="Modelo select">
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 3</p>
                                    <select aria-label="Modelo select">
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Intervalo de audio</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <select aria-label="Modelo select">
                                        <option value="0">Desactivado</option>
                                        <option value="1">30 seg</option>
                                        <option value="2">60 seg</option>
                                        <option value="3">90 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Pausa inicial</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <select aria-label="Modelo select">
                                        <option value="0">Desactivado</option>
                                        <option value="1">30 seg</option>
                                        <option value="2">60 seg</option>
                                        <option value="3">90 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de RCP</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">30 seg</option>
                                        <option value="1">60 seg</option>
                                        <option value="2">90 seg</option>
                                        <option value="3">120 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Grabación de audio</p>
                                    <input type='checkbox' className='form-check-input' />
                                </div>
                            </div>
                        </div>

                        <div className='card row'>
                            <h6 className='card-header text-center'>Marcapasos</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modo</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">Demanda</option>
                                        <option value="1">Fijo</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Frecuencia</p>
                                    <select aria-label="Modelo select">
                                        {this.frecuencyOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option + ' PPM'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Amplitud</p>
                                    {/* TODO:de 10 a 200 con incrementos de 10 unidad mA */}
                                    <select aria-label="Modelo select">
                                        {this.amplitudOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option + ' mA'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Audio</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary-emphasis'>Volumen</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>BIP</p>
                                    <select aria-label="Modelo select">
                                        <option value="0">Silencio</option>
                                        <option value="10">Bajo</option>
                                        <option value="50">Medio</option>
                                        <option value="99">Alto</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Alarma</p>
                                    <select aria-label="Modelo select">
                                        <option value="10">Bajo</option>
                                        <option value="50">Medio</option>
                                        <option value="99">Alto</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='container'>
                        <button
                            type="button"
                            className='mx-1 btn btn-warning'
                            disabled={!targetReadable}
                            onClick={this.monitorVariables}
                        >
                            Recargar
                        </button>
                        <button
                            type="button"
                            className='mx-1 btn btn-primary'
                            disabled={!targetReadable}
                            onClick={this.writeVariables}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default CpuVar