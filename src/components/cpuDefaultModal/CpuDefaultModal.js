import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import NumericInput from "../numericInput/NumericInput";
const { ipcRenderer } = window.require('electron');

class CpuDefaultModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            targetReadable: props.targetReadable,
            editModalShow: false,
            bpm1Error: false,
            sat1Error: false,
            ecg1Error: false,
            ecg2Error: false,
            sat2Error: false,
            bpm2Error: false,
            form: {
                model: '',
                date: '',
                language: '',
                speed: '',
                grid: '',
                automaticPrintTest: '',
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
                deaAudioRecord: false,
                pacemakerMode: '',
                pacemakerFrecuency: '',
                pacemakerAmplitude: '',
                audioBip: '',
                audioAlarm: '',
                demo: ''
            },
            actualDateCheck: false
        };
        this.modelOptions = [];
        for (let i = 1; i <= 32; i++) {
            this.modelOptions.push({ value: i - 1, label: `DB${i.toString().padStart(4, '0')}` });
        }

        this.frecuencyOptions = [];
        for (let i = 30; i <= 180; i += 10) {
            this.frecuencyOptions.push({ value: i, label: `${i} ppm` });
        }

        this.amplitudOptions = [];
        for (let i = 10; i <= 200; i += 10) {
            this.amplitudOptions.push({ value: i, label: `${i} mA` });
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
    }

    componentDidMount() {
        ipcRenderer.on('handle-fetch-data', (event, data) => {
            this.setState({form: data.message});
            this.props.onUpdate(data.message);
        });
        ipcRenderer.on('handle-save-data', (event, data) => {
            this.setState({form:data.message.data});
            this.props.onUpdate(data.message.data);
        });
        this.loadSaveData();
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('handle-fetch-data');
        ipcRenderer.removeAllListeners('handle-save-data');
    }

    componentDidUpdate(prevProps, prevState) {
        //if is show and prev is not show then load data
        if (this.props.show && !prevProps.show) {
            this.loadSaveData();
        }
    }

    loadSaveData(){
        ipcRenderer.send('fetch-data-from-storage', "cpuDefaultConfig");
    }

    saveDataInStorage(item){
        ipcRenderer.send('save-data-in-storage', { key: 'cpuDefaultConfig', data: item });
    }
    
    updateFormValue(key, value) {
        const oldForm = { ...this.state.form };

        if (!(typeof value == "boolean")) {
            value = parseInt(value);
        }

        oldForm[key] = value;
        this.setState({
            form: oldForm,
        });
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

    handleSubmit = () => {
        let form = this.state.form;
        const defaultBooleans = ['grid', 'deaAudioRecord', 'automaticPrintTest', 'demo'];
    
        defaultBooleans.forEach((key) => {
            if (form[key] === undefined) {
                form[key] = false;
            }
        });
    
        this.saveDataInStorage(form);
    }


    render() {
        const actualDateCheck = this.state.actualDateCheck;
        const form = this.state.form;
        const bpm1Error = this.state.bpm1Error;
        const sat1Error = this.state.sat1Error;
        const ecg1Error = this.state.ecg1Error;
        const ecg2Error = this.state.ecg2Error;
        const sat2Error = this.state.sat2Error;
        const bpm2Error = this.state.bpm2Error;

        const isBetween = (value, min, max) => {
            return value >= min && value <= max;
        }

        const isSome = (value, options) => {
            return options.some(option => option.value === value);
        }

        const isSomeValue = (value, options) => {
            return options.some(option => option === value);
        }

        return (
            <Modal size="xl" show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header>
                    <Modal.Title>Editar valores default</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row cpuvar'>
                        <div className='col-3 my-1'>
                            <div className='card row'>
                                <h6 className='card-header text-center'>General</h6>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Modelo</p>
                                        <select key={form.model} className={!isSome(form.model, this.modelOptions) ? 'invalid' : ''} value={form.model} onChange={(e) => this.updateFormValue('model', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.modelOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Fecha y hora</p>
                                        <div>
                                            <label htmlFor='date-check' className='mx-1'>Actual</label>
                                            <input
                                                // 
                                                disabled
                                                id='date-check'
                                                type='checkbox'
                                                className='form-check-input'
                                                checked={actualDateCheck}
                                                onChange={() => {
                                                    if (actualDateCheck) {
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
                                            //disabled={actualDateCheck || !targetReadable}
                                            disabled
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
                                        <select className={!isBetween(form.language, 0, 2) ? 'invalid' : ''} value={form.language} onChange={(e) => this.updateFormValue('language', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="0">Español</option>
                                            <option value="1">Inglés</option>
                                            <option value="2">Portugués</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Velocidad</p>
                                        <select className={!isBetween(form.speed, 0, 2) ? 'invalid' : ''} value={form.speed} onChange={(e) => this.updateFormValue('speed', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <p className='card-text text-secondary'>Impresión automática de test</p>
                                        <input checked={form.automaticPrintTest ? form.automaticPrintTest : false} type='checkbox' className='form-check-input' onChange={(e) => this.updateFormValue('automaticPrintTest', e.target.checked)} />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Fuente</p>
                                        <select className={!isBetween(form.source, 0, 2) ? 'invalid' : ''} value={form.source} onChange={(e) => this.updateFormValue('source', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select className={!isSome(form.externalEnergy, this.energyOptions) ? 'invalid' : ''} value={form.externalEnergy} onChange={(e) => this.updateFormValue('externalEnergy', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.energyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Internas</p>
                                        <select className={!isSome(form.internalEnergy, this.intenalEnergyOptions) ? 'invalid' : ''} value={form.internalEnergy} onChange={(e) => this.updateFormValue('internalEnergy', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select

                                            className={!isBetween(form.spo2, 1, 2) ? 'invalid' : ''}
                                            value={form.spo2} onChange={(e) => this.updateFormValue('spo2', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="1">Apexar BAT100</option>
                                            <option value="2">Unicare UN02</option>
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
                                            <NumericInput value={form.bpmHigh1} min={30} max={255} error={bpm1Error} className={"col-4 "} onChange={(value) => this.handleInputChange('bpmHigh1', value)} onError={() => this.setState({ bpm1Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.bpmLow1} min={30} max={255} error={bpm1Error} className={"col-4  "} onChange={(value) => this.handleInputChange('bpmLow1', value)} onError={() => this.setState({ bpm1Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary-emphasis'>Saturación</p>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Alta</p>
                                            <NumericInput value={form.satHigh1} min={80} max={100} error={sat1Error} className="col-4 " onChange={(value) => this.handleInputChange('satHigh1', value)} onError={() => this.setState({ sat1Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.satLow1} min={80} max={100} error={sat1Error} className="col-4 " onChange={(value) => this.handleInputChange('satLow1', value)} onError={() => this.setState({ sat1Error: true })} />
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
                                            <NumericInput value={form.bpmHigh2} min={30} max={255} error={bpm2Error} className="col-4 " onChange={(value) => this.handleInputChange('bpmHigh2', value)} onError={() => this.setState({ bpm2Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.bpmLow2} min={30} max={255} error={bpm2Error} className="col-4 " onChange={(value) => this.handleInputChange('bpmLow2', value)} onError={() => this.setState({ bpm2Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary-emphasis'>Saturación</p>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Alta</p>
                                            <NumericInput value={form.satHigh2} min={80} max={100} error={sat2Error} className="col-4 " onChange={(value) => this.handleInputChange('satHigh2', value)} onError={() => this.setState({ sat2Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.satLow2} min={80} max={100} error={sat2Error} className="col-4 " onChange={(value) => this.handleInputChange('satLow2', value)} onError={() => this.setState({ sat2Error: true })} />
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
                                        <select className={!isSomeValue(form.ecgElectrodes, [3, 5]) ? 'invalid' : ''} value={form.ecgElectrodes} onChange={(e) => this.updateFormValue('ecgElectrodes', e.target.value)} >
                                            <option value="-1" hidden>--</option>
                                            <option value="3">3 hilos</option>
                                            <option value="5">5 hilos</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Derivación</p>
                                        <select className={!isSomeValue(form.ecgDerivation, [0, 1, 2, 3, 4, 5, 6, 100]) ? 'invalid' : ''} value={form.ecgDerivation} onChange={(e) => this.updateFormValue('ecgDerivation', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="0">DI</option>
                                            <option value="1">DII</option>
                                            <option value="2">DIII</option>
                                            <option disabled={form.ecgElectrodes === 3} value="3">aVR</option>
                                            <option disabled={form.ecgElectrodes === 3} value="4">aVL</option>
                                            <option disabled={form.ecgElectrodes === 3} value="5">aVF</option>
                                            <option disabled={form.ecgElectrodes === 3} value="6">V</option>
                                            <option value="100">Paletas</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Amplitud</p>
                                        <select className={!isBetween(form.ecgAmplitude, 0, 3) ? 'invalid' : ''} value={form.ecgAmplitude} onChange={(e) => this.updateFormValue('ecgAmplitude', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select className={!isBetween(form.ecgLineFilter, 0, 2) ? 'invalid' : ''} value={form.ecgLineFilter} onChange={(e) => this.updateFormValue('ecgLineFilter', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                            <NumericInput value={form.ecgHigh1} min={20} max={250} error={ecg1Error} className="col-4 " onChange={(value) => this.handleInputChange('ecgHigh1', value)} onError={() => this.setState({ ecg1Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.ecgLow1} min={20} max={250} error={ecg1Error} className="col-4 " onChange={(value) => this.handleInputChange('ecgLow1', value)} onError={() => this.setState({ ecg1Error: true })} />
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
                                            <NumericInput value={form.ecgHigh2} min={20} max={250} error={ecg2Error} className="col-4 " onChange={(value) => this.handleInputChange('ecgHigh2', value)} onError={() => this.setState({ ecg2Error: true })} />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <p className='card-text text-secondary'>Baja</p>
                                            <NumericInput value={form.ecgLow2} min={20} max={250} error={ecg2Error} className="col-4 " onChange={(value) => this.handleInputChange('ecgLow2', value)} onError={() => this.setState({ ecg2Error: true })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='card row'>
                                <h6 className='card-header text-center'>Demo</h6>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Demo</p>
                                        <input checked={form.demo ? form.demo : false} type='checkbox' className='form-check-input' onChange={(e) => this.updateFormValue('demo', e.target.checked)} />
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
                                        <select className={!isSome(form.deaEnergy1, this.energyOptions) ? 'invalid' : ''} value={form.deaEnergy1} onChange={(e) => this.updateFormValue('deaEnergy1', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.energyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Energía 2</p>
                                        <select className={!isSome(form.deaEnergy2, this.energyOptions) ? 'invalid' : ''} value={form.deaEnergy2} onChange={(e) => this.updateFormValue('deaEnergy2', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.energyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Energía 3</p>
                                        <select className={!isSome(form.deaEnergy3, this.energyOptions) ? 'invalid' : ''} value={form.deaEnergy3} onChange={(e) => this.updateFormValue('deaEnergy3', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select className={!isBetween(form.deaAudioInterval, 0, 3) ? 'invalid' : ''} value={form.deaAudioInterval} onChange={(e) => this.updateFormValue('deaAudioInterval', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select className={!isBetween(form.deaInitialPause, 0, 3) ? 'invalid' : ''} value={form.deaInitialPause} onChange={(e) => this.updateFormValue('deaInitialPause', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="0">Desactivado</option>
                                            <option value="1">30 seg</option>
                                            <option value="2">60 seg</option>
                                            <option value="3">90 seg</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Tiempo de RCP</p>
                                        <select className={!isBetween(form.deaRcpTime, 0, 3) ? 'invalid' : ''} value={form.deaRcpTime} onChange={(e) => this.updateFormValue('deaRcpTime', e.target.value)}>
                                            <option value="-1" hidden>--</option>
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
                                        <select className={!isBetween(form.pacemakerMode, 0, 1) ? 'invalid' : ''} value={form.pacemakerMode} onChange={(e) => this.updateFormValue('pacemakerMode', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="0">Demanda</option>
                                            <option value="1">Fijo</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Frecuencia</p>
                                        <select className={!isSome(form.pacemakerFrecuency, this.frecuencyOptions) ? 'invalid' : ''} value={form.pacemakerFrecuency} onChange={(e) => this.updateFormValue('pacemakerFrecuency', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.frecuencyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Amplitud</p>
                                        {/* TODO:de 10 a 200 con incrementos de 10 unidad mA */}
                                        <select className={!isSome(form.pacemakerAmplitude, this.amplitudOptions) ? 'invalid' : ''} value={form.pacemakerAmplitude} onChange={(e) => this.updateFormValue('pacemakerAmplitude', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            {this.amplitudOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
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
                                        <select className={!isSomeValue(form.audioBip, [0, 10, 50, 99]) ? 'invalid' : ''} value={form.audioBip} onChange={(e) => this.updateFormValue('audioBip', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="0">Silencio</option>
                                            <option value="10">Bajo</option>
                                            <option value="50">Medio</option>
                                            <option value="99">Alto</option>
                                        </select>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <p className='card-text text-secondary'>Alarma</p>
                                        <select className={!isSomeValue(form.audioAlarm, [10, 50, 99]) ? 'invalid' : ''} value={form.audioAlarm} onChange={(e) => this.updateFormValue('audioAlarm', e.target.value)}>
                                            <option value="-1" hidden>--</option>
                                            <option value="10">Bajo</option>
                                            <option value="50">Medio</option>
                                            <option value="99">Alto</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={this.props.handleClose}
                    >
                        Volver
                    </Button>
                    <Button variant="primary"
                        onClick={() => {
                            this.handleSubmit();
                            this.props.handleClose();
                         }}
                    >
                        Editar
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
};

export default CpuDefaultModal;