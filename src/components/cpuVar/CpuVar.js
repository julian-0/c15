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
            ecg1Error: false,
            ecg2Error: false,
            sat2Error: false,
            bpm2Error: false,
            form: {
                model: null,
                date: '',
                language: '',
                speed: '',
                grid: '',
                source: '',
                externalEnergy: '',
                internalEnergy: '',
                spo2: '',
                bpmHigh1: '',
                bpmLow1: '',
                satHigh1: '',
                satLow1: '',
                bpmHigh2: '',
                bpmLow2: '',
                satHigh2: '',
                satLow2: '',
                ecgElectrodes: '',
                ecgDerivation: '',
                ecgAmplitude: '',
                ecgLineFilter: '',
                ecgHigh1: '',
                ecgLow1: '',
                ecgHigh2: '',
                ecgLow2: '',
                deaEnergy1: '',
                deaEnergy2: '',
                deaEnergy3: '',
                deaAudioInterval: '',
                deaInitialPause: '',
                deaRcpTime: '',
                deaAudioRecord: '',
                pacemakerMode: '',
                pacemakerFrecuency: '',
                pacemakerAmplitude: '',
                audioBip: '',
                audioAlarm: ''
            },
            actualDateCheck: false
        };
        this.variablesInfo = [
            { name: 'model', pointer: 'model_ptr', size: 1, type: 'char' },
            { name: 'date', pointer: 'date_ptr', size: 1, type: 'char' },
            { name: 'language', pointer: 'language_ptr', size: 1, type: 'char' },
            { name: 'speed', pointer: 'speed_ptr', size: 1, type: 'char' },
            { name: 'grid', pointer: 'grid_ptr', size: 1, type: 'char' },
            { name: 'source', pointer: 'source_ptr', size: 1, type: 'char' },
            { name: 'externalEnergy', pointer: 'externalEnergy_ptr', size: 1, type: 'char' },
            { name: 'internalEnergy', pointer: 'internalEnergy_ptr', size: 1, type: 'char' },
            { name: 'spo2', pointer: 'spo2_ptr', size: 1, type: 'char' },
            { name: 'bpmHigh1', pointer: 'bpmHigh1_ptr', size: 1, type: 'char' },
            { name: 'bpmLow1', pointer: 'bpmLow1_ptr', size: 1, type: 'char' },
            { name: 'satHigh1', pointer: 'satHigh1_ptr', size: 1, type: 'char' },
            { name: 'satLow1', pointer: 'satLow1_ptr', size: 1, type: 'char' },
            { name: 'bpmHigh2', pointer: 'bpmHigh2_ptr', size: 1, type: 'char' },
            { name: 'bpmLow2', pointer: 'bpmLow2_ptr', size: 1, type: 'char' },
            { name: 'satHigh2', pointer: 'satHigh2_ptr', size: 1, type: 'char' },
            { name: 'satLow2', pointer: 'satLow2_ptr', size: 1, type: 'char' },
            { name: 'ecgElectrodes', pointer: 'ecgElectrodes_ptr', size: 1, type: 'char' },
            { name: 'ecgDerivation', pointer: 'ecgDerivation_ptr', size: 1, type: 'char' },
            { name: 'ecgAmplitude', pointer: 'ecgAmplitude_ptr', size: 1, type: 'char' },
            { name: 'ecgLineFilter', pointer: 'ecgLineFilter_ptr', size: 1, type: 'char' },
            { name: 'ecgHigh1', pointer: 'ecgHigh1_ptr', size: 1, type: 'char' },
            { name: 'ecgLow1', pointer: 'ecgLow1_ptr', size: 1, type: 'char' },
            { name: 'ecgHigh2', pointer: 'ecgHigh2_ptr', size: 1, type: 'char' },
            { name: 'ecgLow2', pointer: 'ecgLow2_ptr', size: 1, type: 'char' },
            { name: 'deaEnergy1', pointer: 'deaEnergy1_ptr', size: 1, type: 'char' },
            { name: 'deaEnergy2', pointer: 'deaEnergy2_ptr', size: 1, type: 'char' },
            { name: 'deaEnergy3', pointer: 'deaEnergy3_ptr', size: 1, type: 'char' },
            { name: 'deaAudioInterval', pointer: 'deaAudioInterval_ptr', size: 1, type: 'char' },
            { name: 'deaInitialPause', pointer: 'deaInitialPause_ptr', size: 1, type: 'char' },
            { name: 'deaRcpTime', pointer: 'deaRcpTime_ptr', size: 1, type: 'char' },
            { name: 'deaAudioRecord', pointer: 'deaAudioRecord_ptr', size: 1, type: 'char' },
            { name: 'pacemakerMode', pointer: 'pacemakerMode_ptr', size: 1, type: 'char' },
            { name: 'pacemakerFrecuency', pointer: 'pacemakerFrecuency_ptr', size: 1, type: 'char' },
            { name: 'pacemakerAmplitude', pointer: 'pacemakerAmplitude_ptr', size: 1, type: 'char' },
            { name: 'audioBip', pointer: 'audioBip_ptr', size: 1, type: 'char' },
            { name: 'audioAlarm', pointer: 'audioAlarm_ptr', size: 1, type: 'char' },
        ];
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

        if(this.props.targetReadable !== prevProps.targetReadable && this.props.targetReadable) {
            this.monitorVariables();
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
        // this.setState({
        //     form: {
        //         model: this.getRandomInt(1, 4),
        //         date: '2020-10-10T10:10',
        //         language: this.getRandomInt(0, 3),
        //         speed: this.getRandomInt(0, 3),
        //         grid: true,
        //         source: 0,
        //         externalEnergy: 0,
        //         internalEnergy: 0,
        //         spo2: 0,
        //         bpmHigh1: this.getRandomInt(30, 256),
        //         bpmLow1: 50,
        //         satHigh1: 90,
        //         satLow1: 85,
        //         bpmHigh2: 200,
        //         bpmLow2: 50,
        //         satHigh2: 99,
        //         satLow2: 81,
        //         ecgElectrodes: "3",
        //         ecgDerivation: 0,
        //         ecgAmplitude: 0,
        //         ecgLineFilter: 0,
        //         ecgHigh1: 0,
        //         ecgLow1: 0,
        //         ecgHigh2: 0,
        //         ecgLow2: 0,
        //         deaEnergy1: 0,
        //         deaEnergy2: 0,
        //         deaEnergy3: 0,
        //         deaAudioInterval: 0,
        //         deaInitialPause: 0,
        //         deaRcpTime: 0,
        //         deaAudioRecord: true,
        //         pacemakerMode: 0,
        //         pacemakerFrecuency: 0,
        //         pacemakerAmplitude: 0,
        //         audioBip: 0,
        //         audioAlarm: 0
        //     }
        // });

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
        const mockdata = {
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
            satHigh1: 90,
            satLow1: 85,
            bpmHigh2: 200,
            bpmLow2: 50,
            satHigh2: 99,
            satLow2: 81,
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
        };
        data = Object.entries(mockdata).map(([name, value]) => ({ name, value })); //TODO: sacar

        const newState = {};
        this.variablesInfo.forEach(v => {
            newState[v.name] = this.findVariableValueByName(v.name, data);
        });
        this.setState({ form: newState });
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
        const errorMessages = {
            bpm: 'SpO2 BPM valores incorrectos',
            sat: 'SpO2 Saturación valores incorrectos',
            ecg: 'ECG valores incorrectos'
        };

        const errors = [];

        if (this.state.bpm1Error) {
            errors.push(`Alarma 1: ${errorMessages.bpm}`);
        }
        if (this.state.sat1Error) {
            errors.push(`Alarma 1: ${errorMessages.sat}`);
        }
        if (this.state.ecg1Error) {
            errors.push(`Alarma 1: ${errorMessages.ecg}`);
        }
        if (this.state.bpm2Error) {
            errors.push(`Alarma 2: ${errorMessages.bpm}`);
        }
        if (this.state.sat2Error) {
            errors.push(`Alarma 2: ${errorMessages.sat}`);
        }
        if (this.state.ecg2Error) {
            errors.push(`Alarma 2: ${errorMessages.ecg}`);
        }

        if ((form.date === undefined || form.date === '') && !this.state.actualDateCheck) {
            errors.push('Debe ingresar una fecha y hora válida.');
        }

        if (errors.length > 0) {
            const errorMessage = errors.join('\n');
            toast.error(errorMessage, CpuVar.toastProperties);
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
        const form = { ...this.state.form, [fieldName]: value };
        const highFieldName = fieldName.replace('Low', 'High');
        const lowFieldName = fieldName.replace('High', 'Low');
        const errorStateName = fieldName.replace(/High|Low/g, '') + 'Error';
        const errorStateValue = this.state[errorStateName];

        if ((fieldName.includes('High') && value < form[lowFieldName]) ||
            (fieldName.includes('Low') && value > form[highFieldName])) {
            if (!errorStateValue) {
                this.setState({ [errorStateName]: true });
            }
        } else {
            if (errorStateValue) {
                this.setState({ [errorStateName]: false });
            }
        }
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
        const bpm1Error = this.state.bpm1Error;
        const sat1Error = this.state.sat1Error;
        const ecg1Error = this.state.ecg1Error;
        const ecg2Error = this.state.ecg2Error;
        const sat2Error = this.state.sat2Error;
        const bpm2Error = this.state.bpm2Error;

        return (
            <div className='col cpuvar'>
                <div className='row'>
                    <div className='col-3 my-1'>
                        <div className='card row'>
                            <h6 className='card-header text-center'>General</h6>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Modelo</p>
                                    <select disabled={!targetReadable} value={form.model} onChange={(e) => this.updateFormValue('model', e.target.value)}>
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
                                            disabled={!targetReadable}
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
                                        disabled={actualDateCheck || !targetReadable}
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
                                    <select disabled={!targetReadable} value={form.language} onChange={(e) => this.updateFormValue('language', e.target.value)}>
                                        <option value="0">Español</option>
                                        <option value="1">Inglés</option>
                                        <option value="2">Portugués</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Velocidad</p>
                                    <select disabled={!targetReadable} value={form.speed} onChange={(e) => this.updateFormValue('speed', e.target.value)}>
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
                                    <input disabled={!targetReadable} checked={form.grid ? form.grid : false} type='checkbox' className='form-check-input' onChange={(e) => this.updateFormValue('grid', e.target.checked)} />
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Fuente</p>
                                    <select disabled={!targetReadable} value={form.source} onChange={(e) => this.updateFormValue('source', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.externalEnergy} onChange={(e) => this.updateFormValue('externalEnergy', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Internas</p>
                                    <select disabled={!targetReadable} value={form.internalEnergy} onChange={(e) => this.updateFormValue('internalEnergy', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.spo2} onChange={(e) => this.updateFormValue('spo2', e.target.value)}>
                                        <option value="0">Apexar BAT100</option>
                                        <option value="1">Unicare UN02</option>
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
                                        <NumericInput disabled={!targetReadable} value={form.bpmHigh1} min={30} max={255} error={bpm1Error} className={"col-4 text-secondary-emphasis"} onChange={(value) => this.handleInputChange('bpmHigh1', value)} onError={() => this.setState({ bpm1Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.bpmLow1} min={30} max={255} error={bpm1Error} className={"col-4 text-secondary-emphasis "} onChange={(value) => this.handleInputChange('bpmLow1', value)} onError={() => this.setState({ bpm1Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <NumericInput disabled={!targetReadable} value={form.satHigh1} min={80} max={100} error={sat1Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('satHigh1', value)} onError={() => this.setState({ sat1Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.satLow1} min={80} max={100} error={sat1Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('satLow1', value)} onError={() => this.setState({ sat1Error: true })} />
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
                                        <NumericInput disabled={!targetReadable} value={form.bpmHigh2} min={30} max={255} error={bpm2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmHigh2', value)} onError={() => this.setState({ bpm2Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.bpmLow2} min={30} max={255} error={bpm2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('bpmLow2', value)} onError={() => this.setState({ bpm2Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary-emphasis'>Saturación</p>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alta</p>
                                        <NumericInput disabled={!targetReadable} value={form.satHigh2} min={80} max={100} error={sat2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('satHigh2', value)} onError={() => this.setState({ sat2Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.satLow2} min={80} max={100} error={sat2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('satLow2', value)} onError={() => this.setState({ sat2Error: true })} />
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
                                    <select disabled={!targetReadable} value={form.ecgElectrodes} onChange={(e) => this.updateFormValue('ecgElectrodes', e.target.value)}>
                                        <option value="3">3 hilos</option>
                                        <option value="5">5 hilos</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Derivación</p>
                                    <select disabled={!targetReadable} value={form.ecgDerivation} onChange={(e) => this.updateFormValue('ecgDerivation', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.ecgAmplitude} onChange={(e) => this.updateFormValue('ecgAmplitude', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.ecgLineFilter} onChange={(e) => this.updateFormValue('ecgLineFilter', e.target.value)}>
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
                                        <NumericInput disabled={!targetReadable} value={form.ecgHigh1} min={20} max={250} error={ecg1Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgHigh1', value)} onError={() => this.setState({ ecg1Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.ecgLow1} min={20} max={250} error={ecg1Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgLow1', value)} onError={() => this.setState({ ecg1Error: true })} />
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
                                        <NumericInput disabled={!targetReadable} value={form.ecgHigh2} min={20} max={250} error={ecg2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgHigh2', value)} onError={() => this.setState({ ecg2Error: true })} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Baja</p>
                                        <NumericInput disabled={!targetReadable} value={form.ecgLow2} min={20} max={250} error={ecg2Error} className="col-4 text-secondary-emphasis" onChange={(value) => this.handleInputChange('ecgLow2', value)} onError={() => this.setState({ ecg2Error: true })} />
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
                                    <select disabled={!targetReadable} value={form.deaEnergy1} onChange={(e) => this.updateFormValue('deaEnergy1', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 2</p>
                                    <select disabled={!targetReadable} value={form.deaEnergy2} onChange={(e) => this.updateFormValue('deaEnergy2', e.target.value)}>
                                        {this.energyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Energía 3</p>
                                    <select disabled={!targetReadable} value={form.deaEnergy3} onChange={(e) => this.updateFormValue('deaEnergy3', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.deaAudioInterval} onChange={(e) => this.updateFormValue('deaAudioInterval', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.deaInitialPause} onChange={(e) => this.updateFormValue('deaInitialPause', e.target.value)}>
                                        <option value="0">Desactivado</option>
                                        <option value="1">30 seg</option>
                                        <option value="2">60 seg</option>
                                        <option value="3">90 seg</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Tiempo de RCP</p>
                                    <select disabled={!targetReadable} value={form.deaRcpTime} onChange={(e) => this.updateFormValue('deaRcpTime', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.pacemakerMode} onChange={(e) => this.updateFormValue('pacemakerMode', e.target.value)}>
                                        <option value="0">Demanda</option>
                                        <option value="1">Fijo</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Frecuencia</p>
                                    <select disabled={!targetReadable} value={form.pacemakerFrecuency} onChange={(e) => this.updateFormValue('pacemakerFrecuency', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.pacemakerAmplitude} onChange={(e) => this.updateFormValue('pacemakerAmplitude', e.target.value)}>
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
                                    <select disabled={!targetReadable} value={form.audioBip} onChange={(e) => this.updateFormValue('audioBip', e.target.value)}>
                                        <option value="0">Silencio</option>
                                        <option value="10">Bajo</option>
                                        <option value="50">Medio</option>
                                        <option value="99">Alto</option>
                                    </select>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p className='card-text text-secondary'>Alarma</p>
                                    <select disabled={!targetReadable} value={form.audioAlarm} onChange={(e) => this.updateFormValue('audioAlarm', e.target.value)}>
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