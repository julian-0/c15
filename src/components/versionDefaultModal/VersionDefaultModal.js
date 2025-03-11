import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import NumericInput from "../numericInput/NumericInput";
const { ipcRenderer } = window.require('electron');

class VersionDefaultModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            targetReadable: props.targetReadable,
            editModalShow: false,
            revisionError: false,
            variantError: false,
            reworkError: false,
            form: {
                revision: '',
                variant: '',
                rework: ''
            }
        };
    }

    componentDidMount() {
        ipcRenderer.on('handle-fetch-data', (event, data) => {
            this.setState({ form: data.message });
            this.props.onUpdate(data.message);
        });
        ipcRenderer.on('handle-save-data', (event, data) => {
            this.setState({ form: data.message });
            this.props.onUpdate(data.message);
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

    loadSaveData() {
        ipcRenderer.send('fetch-data-from-storage', "versionDefaultConfig");
    }

    saveDataInStorage(item) {
        ipcRenderer.send('save-data-in-storage', { key: 'versionDefaultConfig', data: item });
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

    handleInputChange = (fieldName, value) => {
        const form = { ...this.state.form, [fieldName]: value };

        const errorStateName = fieldName.replace(/High|Low/g, '') + 'Error';
        const errorStateValue = this.state[errorStateName];

        if (errorStateValue) {
            this.setState({ [errorStateName]: false });
        }
        this.setState({ form });
    }

    handleSubmit = () => {
        let form = this.state.form;
        this.saveDataInStorage(form);
    }


    render() {
        const form = this.state.form;
        const revisionError = this.state.revisionError;
        const variantError = this.state.variantError;
        const reworkError = this.state.reworkError;

        return (
            <Modal size="s" show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header>
                    <Modal.Title>Editar valores default</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='mt-3 programmer card'>
                        <h4 className='card-header'>Versión del hardware</h4>
                        <div className='card-body'>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Revisión PCB</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Variante</p>
                                    </div>
                                    <div className='col'>
                                        <p className='card-text text-secondary'>Rework</p>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <div className='col'>
                                        <NumericInput
                                            min={0}
                                            className="col-10"
                                            error={revisionError}
                                            onChange={(value) => this.handleInputChange('revision', value)}
                                            onError={() => this.setState({ ecg1Error: true })}
                                            value={form.revision} />
                                    </div>
                                    <div className='col'>
                                        <NumericInput
                                            min={0}
                                            className="col-10"
                                            error={variantError}
                                            onChange={(value) => this.handleInputChange('variant', value)}
                                            onError={() => this.setState({ variantError: true })}
                                            value={form.variant} />
                                    </div>
                                    <div className='col'>
                                        <NumericInput
                                            min={0}
                                            className="col-10"
                                            error={reworkError}
                                            onChange={(value) => this.handleInputChange('rework', value)}
                                            onError={() => this.setState({ reworkError: true })}
                                            value={form.rework} />
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

export default VersionDefaultModal;