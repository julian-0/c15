import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MicroConnected from '../MicroConnected';
import './EcgVar.css';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;

export class EcgVar extends MicroConnected {

    constructor(props) {
        super(props);
        this.state = {
            targetReadable: props.targetReadable,
            variables: [],
            reference: 50,
            writingToastId: undefined
        };
        this.intervalId = null;
        this.variablesInfo = [
            { name: 'impedancia', pointer: 'impedancia_base_ptr', size: 4, type: 'float' },
            { name: 'impedanciaMedida', pointer: 'impedancia_medida_ptr', size: 4, type: 'float' },
            { name: 'frecuenciaCardiaca', pointer: 'frecuencia_cardiaca_ptr', size: 2, type: 'int' },
            { name: 'derivacion', pointer: 'derivacion_ptr', size: 1, type: 'char' },
            { name: 'ganancia', pointer: 'ganancia_ptr', size: 1, type: 'char' },
            { name: 'cantElectrodos', pointer: 'cant_elect_ptr', size: 1, type: 'char' },
            { name: 'filtro', pointer: 'filtro_ptr', size: 1, type: 'char' },
            { name: 'insto', pointer: 'insto_ptr', size: 1, type: 'char' },
            { name: 'ra', pointer: 'RA_ptr', size: 1, type: 'char' },
            { name: 'la', pointer: 'LA_ptr', size: 1, type: 'char' },
            { name: 'll', pointer: 'LL_ptr', size: 1, type: 'char' },
            { name: 'rl', pointer: 'RL_ptr', size: 1, type: 'char' },
            { name: 'v1', pointer: 'V1_ptr', size: 1, type: 'char' },
            { name: 'estadoDea', pointer: 'estado_dea_ptr', size: 1, type: 'char' }
        ];
        this.writeCalibrationValue = this.writeCalibrationValue.bind(this);
    }

    getVariableByName(name) {
        return this.variablesInfo.find(v => v.name === name);
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
                case "WRITE_FLASH":
                    break;
                default:
                    console.log("Unknown command: " + data.command);
                    break;
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

    writeCalibrationValue() {
        const reference = this.state.reference;
        if (isNaN(reference) || reference < 0 || reference > 10000) {
            toast.error('Valor de calibración inválido', EcgVar.toastProperties);
            return;
        }
        const kc = this.state.reference - this.state.impedanciaMedida;
        const variables = [{
            pointer: "cte_calibracion_imp",
            size: 4,
            type: "float",
            value: kc
        }];

        this.sendToMicroVariables("WRITE_FLASH", {
            variables: variables,
            direct: true
        });

        const calibrationPromise = new Promise((resolve, reject) => {

            const proccess = (event, args) => {
                let data = args.data;
                switch (data.command) {
                    case "WRITE_FLASH":
                        ipcRenderer.removeListener('CONTROLLER_RESULT_VARIABLES', proccess);
                        if (data.status === 'OK') {
                            resolve();
                        }
                        else {
                            reject('Error al calibrar');
                        }
                        break;
                    default:
                        break;
                }
            };

            ipcRenderer.on('CONTROLLER_RESULT_VARIABLES', proccess);
        });

        toast.promise(
            calibrationPromise,
            {
                pending: 'Escribiendo valor',
                success: 'Calibración realizada con éxito',
                error: 'Error al calibrar'
            },
            EcgVar.toastProperties
        );
    }

    renderDerivation(derivation) {
        switch (derivation) {
            case 0:
                return 'NA';
            case 1:
                return 'DI';
            case 2:
                return 'DII';
            case 3:
                return 'DIII';
            case 4:
                return 'aVR';
            case 5:
                return 'aVL';
            case 6:
                return 'aVF';
            case 7:
                return 'V';
            case 8:
                return 'PAL';
            default:
                return '--';
        }
    }

    renderGanancia(ganancia) {
        switch (ganancia) {
            case 0:
                return 'NA';
            case 1:
                return 'x0.25';
            case 2:
                return 'x0.5';
            case 3:
                return 'x1';
            case 4:
                return 'x2';
            default:
                return '--';
        }
    }

    renderElectrodos(cantElectrodos) {
        switch (cantElectrodos) {
            case 0:
                return 'NA';
            case 1:
                return '3';
            case 2:
                return '5';
            default:
                return '--';
        }
    }

    renderFiltro(filtro) {
        switch (filtro) {
            case 0:
                return 'NA';
            case 1:
                return 'Desactivado';
            case 2:
                return '50 Hz';
            case 3:
                return '60 Hz';
            default:
                return '--';
        }
    }

    renderDea(estadoDea) {
        switch (estadoDea) {
            case 0:
                return 'Reposo';
            case 1:
                return 'Iniciando análisis';
            case 2:
                return 'Reset';
            case 10:
                return 'Analizando';
            case 11:
                return 'Resultado negativo';
            case 12:
                return 'Resultado positivo';
            default:
                return '--';
        }
    }

    render() {
        const { targetReadable } = this.props;
        const impedancia = this.state.impedancia !== undefined && typeof this.state.impedancia === 'number' ? this.state.impedancia.toFixed(2) + ' Ω' : '--';
        const frecuenciaCardiaca = this.state.frecuenciaCardiaca !== undefined ? this.state.frecuenciaCardiaca + ' ppm' : '--';
        const derivacion = this.state.derivacion !== undefined ? this.state.derivacion : '--';
        const ganancia = this.state.ganancia !== undefined ? this.state.ganancia : '--';
        const cantElectrodos = this.state.cantElectrodos !== undefined ? this.state.cantElectrodos : '--';
        const filtro = this.state.filtro !== undefined ? this.state.filtro : '--';
        const estadoDea = this.state.estadoDea !== undefined ? this.state.estadoDea : '--';
        const insto = this.state.insto;
        const ra = this.state.ra;
        const la = this.state.la;
        const ll = this.state.ll;
        const rl = this.state.rl;
        const v1 = this.state.v1;

        return (
            <div className='col ecgvar'>
                <div className='row justify-content-around'>
                    <div className='col-7'>
                        <div className='row justify-content-center mb-4'>
                            <div className='col-6'>
                                <div className='card row'>
                                    <h6 className='card-header text-center'>Impedancia</h6>
                                    <div className='card-body'>
                                        <div className='d-flex justify-content-between'>
                                            <span className='card-text text-secondary'>Patrón</span>
                                            <div className='d-flex justify-content-end'>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={10000}
                                                    className={"card-text text-secondary-emphasis"}
                                                    value={this.state.reference} // Usa el valor del estado local.
                                                    onChange={(event) => this.setState({ reference: event.target.value })}
                                                    title={'Entre 0 y 10000'}
                                                />
                                                <p> Ω</p>
                                            </div>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <span className='card-text text-secondary'>Valor</span>
                                            <span className='card-text text-secondary-emphasis'>{impedancia}</span>
                                        </div>
                                        <div className='row mt-auto'>
                                            <div className='col'>
                                                <button
                                                    type="button"
                                                    className='btn btn-primary'
                                                    disabled={!targetReadable}
                                                    onClick={this.writeCalibrationValue}
                                                >
                                                    Calibrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='card row'>
                            <h6 className='card-header text-center'>Estado</h6>
                            <div className='card-body col'>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Frecuencia cardíaca</p>
                                    <p className='col card-text text-secondary-emphasis'>{frecuenciaCardiaca}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${insto === 1 ? 'success' : 'danger'}`}>Insto</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Derivación</p>
                                    <p className='col card-text text-secondary-emphasis'>{this.renderDerivation(derivacion)}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${ra === 1 ? 'success' : 'danger'}`}>RA</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Amplitud</p>
                                    <p className='col card-text text-secondary-emphasis'>{this.renderGanancia(ganancia)}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${la === 1 ? 'success' : 'danger'}`}>LA</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Cant electrodos</p>
                                    <p className='col card-text text-secondary-emphasis'>{this.renderElectrodos(cantElectrodos)}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${ll === 1 ? 'success' : 'danger'}`}>LL</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Filtro de linea</p>
                                    <p className='col card-text text-secondary-emphasis'>{this.renderFiltro(filtro)}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${v1 === 1 ? 'success' : 'danger'}`}>V</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Estado DEA</p>
                                    <p className='col card-text text-secondary-emphasis'>{this.renderDea(estadoDea)}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${rl === 1 ? 'success' : 'danger'}`}>RL</p>
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

export default EcgVar