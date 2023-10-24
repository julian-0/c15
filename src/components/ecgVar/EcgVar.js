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
            targetReadable: props.targetReadable,
            variables: []
        };
        this.intervalId = null;
        this.variablesInfo = [
            { name: 'impedancia', pointer: 'impedancia_base_ptr', size: 4, type: 'float' },//TODO: es este puntero o impedancia_medida_ptr?
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
            { name: 'apex', pointer: 'APEX_ptr', size: 1, type: 'char' },
            { name: 'STRN', pointer: 'strn_ptr', size: 1, type: 'char' },
            { name: 'estadoDea', pointer: 'estado_dea_ptr', size: 1, type: 'char' }
        ];
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
                    this.processWriteResult(data);
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
        const kc = 50 - this.state.impedancia;
        this.sendToMicroVariables("WRITE_FLASH", {
            pointer: "cte_calibracion_imp",
            size: 4,
            type: "float",
            value: kc
        });
    }

    processWriteResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error al calibrar');
            return;
        }

        toast.success('Calibración realizada con éxito');
    }

    render() {
        const { targetReadable } = this.props;
        const impedancia = this.state.impedancia !== undefined ? this.state.impedancia : '--';
        const amplitud = this.state.amplitud !== undefined ? this.state.amplitud : '--';
        const frecuenciaCardiaca = this.state.frecuenciaCardiaca !== undefined ? this.state.frecuenciaCardiaca : '--';
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
        const apex = this.state.apex;
        const strn = this.state.strn;

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
                                            <span className='card-text text-secondary'>Valor</span>
                                            <span className='card-text text-secondary-emphasis'>{impedancia}</span>
                                        </div>
                                        <div className='row mt-auto'>
                                            <div className='col'>
                                                <button
                                                    type="button"
                                                    className='btn btn-primary'
                                                    disabled={!targetReadable}
                                                //onClick={this.writeCalibrationValue}
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
                                        <p className={`card-text badge bg-${insto === 1 ? 'succes' : 'danger'}`}>Insto</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Derivación</p>
                                    <p className='col card-text text-secondary-emphasis'>{derivacion}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${ra === 1 ? 'succes' : 'danger'}`}>RA</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Amplitud</p>
                                    <p className='col card-text text-secondary-emphasis'>{amplitud}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${la === 1 ? 'succes' : 'danger'}`}>LA</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Cant electrodos</p>
                                    <p className='col card-text text-secondary-emphasis'>{cantElectrodos}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${ll === 1 ? 'succes' : 'danger'}`}>LL</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Filtro de linea</p>
                                    <p className='col card-text text-secondary-emphasis'>{filtro}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${v1 === 1 ? 'succes' : 'danger'}`}>V</p>
                                    </div>
                                </div>
                                <div className='row'>
                                    <p className='col-6 text-start card-text text-secondary'>Estado DEA</p>
                                    <p className='col card-text text-secondary-emphasis'>{estadoDea}</p>
                                    <div className='col'>
                                        <p className={`card-text badge bg-${rl === 1 ? 'succes' : 'danger'}`}>RL</p>
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