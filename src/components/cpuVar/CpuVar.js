import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
import NumericInput from '../numericInput/NumericInput';
import './CpuVar.css';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;

export class CpuVar extends MicroConnected {

    constructor(props) {
        super(props);
        this.state = {
            targetReadable: props.targetReadable,
            bpm1Error: false,
            sat1Error: false,
            sat2Error: false,
            bpm2Error: false,
            form: {
                // model: 2,
                // date: '2020-10-10T10:10',
                // language: 0,
                // speed: 1,
                // grid: true,
                // source: 0,
                // externalEnergy: 0,
                // internalEnergy: 0,
                // spo2: 0,
                // bpmHigh1: 200,
                // bpmLow1: 50,
                // spo2High1: 90,
                // spo2Low1: 85,
                // bpmHigh2: 200,
                // bpmLow2: 50,
                // spo2High2: 99,
                // spo2Low2: 81,
                // ecgElectrodes: 3,
                // ecgDerivation: 0,
                // ecgAmplitude: 0,
                // ecgLineFilter: 0,
                // ecgHigh1: 0,
                // ecgLow1: 0,
                // ecgHigh2: 0,
                // ecgLow2: 0,
                // deaEnergy1: 0,
                // deaEnergy2: 0,
                // deaEnergy3: 0,
                // deaAudioInterval: 0,
                // deaInitialPause: 0,
                // deaRcpTime: 0,
                // deaAudioRecord: true,
                // pacemakerMode: 0,
                // pacemakerFrecuency: 0,
                // pacemakerAmplitude: 0,
                // audioBip: 0,
                // audioAlarm: 0
                date: undefined
            },
            actualDateCheck: false
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

        this.monitorVariables = this.monitorVariables.bind(this);
        this.writeVariables = this.writeVariables.bind(this);
        this.updateFormValue = this.updateFormValue.bind(this);
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
        this.monitorVariables();
    }

    componentWillUnmount() {
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT_VARIABLES');
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.actualDateCheck !== prevState.actualDateCheck && this.state.actualDateCheck) {
            this.updateFormValue('date', '');
        }
    }

    sendToMicroVariables(command, body) {
        this.sendToMicro(command, 'VARIABLES', body);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    monitorVariables() {
        //fill form with mock data
        this.setState({
            form: {
                model: this.getRandomInt(1, 4),
                date: '2020-10-10T10:10',
                language: this.getRandomInt(0, 3),
                speed: this.getRandomInt(0, 3),
                grid: true,
                source: 0,
                externalEnergy: 0,
                internalEnergy: 0,
                spo2: 0,
                bpmHigh1: this.getRandomInt(30, 256),
                bpmLow1: 50,
                spo2High1: 90,
                spo2Low1: 85,
                bpmHigh2: 200,
                bpmLow2: 50,
                spo2High2: 99,
                spo2Low2: 81,
                ecgElectrodes: "3",
                ecgDerivation: 0,
                ecgAmplitude: 0,
                ecgLineFilter: 0,
                ecgHigh1: 0,
                ecgLow1: 0,
                ecgHigh2: 0,
                ecgLow2: 0,
                deaEnergy1: 0,
                deaEnergy2: 0,
                deaEnergy3: 0,
                deaAudioInterval: 0,
                deaInitialPause: 0,
                deaRcpTime: 0,
                deaAudioRecord: true,
                pacemakerMode: 0,
                pacemakerFrecuency: 0,
                pacemakerAmplitude: 0,
                audioBip: 0,
                audioAlarm: 0
            }
        });

        // this.sendToMicroVariables("MONITOR", {
        //     variables: this.variablesInfo
        // });
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
        const form = this.state.form;
        const errorBpm = 'El valor de BPM alta no puede ser menor que el de baja.\n';
        const errorSat = 'El valor de saturación alta no puede ser menor que el de baja.\n';
        var error = '';
        //validate that Alarma alta is greater than Alarma baja
        if (form.bpmHigh1 < form.bpmLow1) {
            error += 'Alarma 1: ' + errorBpm;
        }
        if (form.spo2High1 < form.spo2Low1) {
            error += 'Alarma 1: ' + errorSat;
        }
        if (form.bpmHigh2 < form.bpmLow2) {
            error += 'Alarma 2: ' + errorBpm;
        }
        if (form.spo2High2 < form.spo2Low2) {
            error += 'Alarma 2: ' + errorSat;
        }

        if (error) {
            toast.error(error, CpuVar.toastProperties);
            return;
        }
        // this.sendToMicroVariables("WRITE_FLASH", {
        //     pointer: "cte_calibracion_imp",
        //     size: 4,
        //     value: 1
        // });
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

    handleInputChange = (fieldName, value) => {
        //set form[fieldName] with value
        const form = this.state.form;
        form[fieldName] = value;
        this.setState({ form });
    }

    updateFormValue(key, value) {
        const oldForm = { ...this.state.form };

        oldForm[key] = value;
        this.setState({
            form: oldForm,
        });
    }


    render() {
        const { targetReadable } = this.props;
        const actualDateCheck = this.state.actualDateCheck;
        const form = this.state.form;

        return (
            <div className='col cpuvar'>
                <div className='row'>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>General</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modelo</p>
                                    <select value={form.model} onChange={(e) => this.updateFormValue('model', e.target.value)}>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fecha y hora</p>
                                    <div>
                                        <label htmlFor='date-check' className='mx-1'>Actual</label>
                                        <input
                                            id='date-check'
                                            type='checkbox'
                                            className='form-check-input'
                                            checked={actualDateCheck}
                                            onChange={() => {
                                                if (actualDateCheck) {
                                                    //setText('')
                                                    this.updateFormValue('date', '');
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
                                        value={actualDateCheck ? '' : form.date}
                                        className='text-secondary-emphasis'
                                        disabled={actualDateCheck}
                                        title='Formato mm/dd/yyyy hh:mm'
                                        onChange={e => this.updateFormValue('date', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className='card row'>
                            <h6 className='card-header text-center'>Pantalla</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Idioma</p>
                                    <select value={form.language} onChange={(e) => this.updateFormValue('language', e.target.value)}>
                                        <option value="0">Español</option>
                                        <option value="1">Inglés</option>
                                        <option value="2">Portugués</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Velocidad</p>
                                    <select value={form.speed} onChange={(e) => this.updateFormValue('speed', e.target.value)}>
                                        <option value="0">12,5 mm/s</option>
                                        <option value="1">25 mm/s</option>
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
                                    <input checked={form.grid ? form.grid : false} type='checkbox' className='form-check-input' onChange={(e) => this.updateFormValue('grid', e.target.checked)} />
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fuente</p>
                                    <select value={form.source} onChange={(e) => this.updateFormValue('source', e.target.value)}>
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
                                    <select value={form.externalEnergy} onChange={(e) => this.updateFormValue('externalEnergy', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Internas</p>
                                    <select value={form.internalEnergy} onChange={(e) => this.updateFormValue('internalEnergy', e.target.value)}>
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
                                    <select value={form.spo2} onChange={(e) => this.updateFormValue('spo2', e.target.value)}>
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
                                        <NumericInput value={form.bpmHigh1} min={30} max={255} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmHigh1', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.bpmLow1} min={30} max={255} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmLow1', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <NumericInput value={form.spo2High1} min={80} max={100} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('spo2High1', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.spo2Low1} min={80} max={100} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('spo2Low1', value)} />
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
                                        <NumericInput value={form.bpmHigh2} min={30} max={255} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmHigh2', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.bpmLow2} min={30} max={255} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmLow2', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <NumericInput value={form.spo2High2} min={80} max={100} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('spo2High2', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.spo2Low2} min={80} max={100} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('spo2Low2', value)} />
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
                                    <select value={form.ecgElectrodes} onChange={(e) => this.updateFormValue('ecgElectrodes', e.target.value)}>
                                        <option value="3">3 hilos</option>
                                        <option value="5">5 hilos</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Derivación</p>
                                    <select value={form.ecgDerivation} onChange={(e) => this.updateFormValue('ecgDerivation', e.target.value)}>
                                        <option value="0">DI</option>
                                        <option value="1">DII</option>
                                        <option value="2">DIII</option>
                                        <option disabled={form.ecgElectrodes === "3"} value="3">aVR</option>
                                        <option disabled={form.ecgElectrodes === "3"} value="4">aVL</option>
                                        <option disabled={form.ecgElectrodes === "3"} value="5">aVF</option>
                                        <option disabled={form.ecgElectrodes === "3"} value="6">V</option>
                                        <option value="100">Paletas</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Amplitud</p>
                                    <select value={form.ecgAmplitude} onChange={(e) => this.updateFormValue('ecgAmplitude', e.target.value)}>
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
                                    <select value={form.ecgLineFilter} onChange={(e) => this.updateFormValue('ecgLineFilter', e.target.value)}>
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
                                        <NumericInput value={form.ecgHigh1} min={20} max={250} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgHigh1', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.ecgLow1} min={20} max={250} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgLow1', value)} />
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
                                        <NumericInput value={form.ecgHigh2} min={20} max={250} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgHigh2', value)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput value={form.ecgLow2} min={20} max={250} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgLow2', value)} />
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
                                    <select value={form.deaEnergy1} onChange={(e) => this.updateFormValue('deaEnergy1', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 2</p>
                                    <select value={form.deaEnergy2} onChange={(e) => this.updateFormValue('deaEnergy2', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 3</p>
                                    <select value={form.deaEnergy3} onChange={(e) => this.updateFormValue('deaEnergy3', e.target.value)}>
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
                                    <select value={form.deaAudioInterval} onChange={(e) => this.updateFormValue('deaAudioInterval', e.target.value)}>
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
                                    <select value={form.deaInitialPause} onChange={(e) => this.updateFormValue('deaInitialPause', e.target.value)}>
                                        <option value="0">Desactivado</option>
                                        <option value="1">30 seg</option>
                                        <option value="2">60 seg</option>
                                        <option value="3">90 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de RCP</p>
                                    <select value={form.deaRcpTime} onChange={(e) => this.updateFormValue('deaRcpTime', e.target.value)}>
                                        <option value="0">30 seg</option>
                                        <option value="1">60 seg</option>
                                        <option value="2">90 seg</option>
                                        <option value="3">120 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Grabación de audio</p>
                                    <input checked={form.deaAudioRecord ? form.deaAudioRecord : false} type='checkbox' className='form-check-input' onChange={(e) => this.updateFormValue('deaAudioRecord', e.target.checked)} />
                                </div>
                            </div>
                        </div>

                        <div className='card row'>
                            <h6 className='card-header text-center'>Marcapasos</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modo</p>
                                    <select value={form.pacemakerMode} onChange={(e) => this.updateFormValue('pacemakerMode', e.target.value)}>
                                        <option value="0">Demanda</option>
                                        <option value="1">Fijo</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Frecuencia</p>
                                    <select value={form.pacemakerFrecuency} onChange={(e) => this.updateFormValue('pacemakerFrecuency', e.target.value)}>
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
                                    <select value={form.pacemakerAmplitude} onChange={(e) => this.updateFormValue('pacemakerAmplitude', e.target.value)}>
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
                                    <select value={form.audioBip} onChange={(e) => this.updateFormValue('audioBip', e.target.value)}>
                                        <option value="0">Silencio</option>
                                        <option value="10">Bajo</option>
                                        <option value="50">Medio</option>
                                        <option value="99">Alto</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Alarma</p>
                                    <select value={form.audioAlarm} onChange={(e) => this.updateFormValue('audioAlarm', e.target.value)}>
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
                            //disabled={!targetReadable}
                            onClick={this.monitorVariables}
                        >
                            Recargar
                        </button>
                        <button
                            type="button"
                            className='mx-1 btn btn-primary'
                            //disabled={!targetReadable}
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