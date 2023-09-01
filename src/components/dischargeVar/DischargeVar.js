import React, { Component } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;
const loadBalancer = window.require('electron-load-balancer');

export class DischargeVar extends Component {

    static toastProperties = {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    componentDidMount() {
        // 3. Setup listener for controller python output (bounced from main process)
        ipcRenderer.on('CONTROLLER_RESULT', (event, args) => {
            let data = args.data;
            switch (data.command) {
                case "PRENDER":
                    this.processPrenderResult(data);
                    break;
                default:
                    console.log("Unknown command: " + data.command);
            }
        });
    }

    componentWillUnmount() {
        // 4. Remove all output listeners before app shuts down
        ipcRenderer.removeAllListeners('CONTROLLER_RESULT');
    }

    processPrenderResult(response) {
        if (response.status !== 'OK') {
            toast.error('Error prendiendo led', DischargeVar.toastProperties)
            return;
        }
        toast.success('led prendido', DischargeVar.toastProperties);
    }

    prenderLed(led) {
        console.log("Prendiendo " + led)
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            {
                command: "PRENDER",
                variable: led
            }
        );
    }

    render() {
        return (
            <div className='card'>
                <div className='card-body'>
                    <div>
                        <button type="button" className='btn btn-primary' onClick={() => this.prenderLed('led_azul')}>led_azul</button>
                    </div>
                    <div>
                        <button type="button" className='btn btn-danger' onClick={() => this.prenderLed('led_rojo')}>led_rojo</button>
                    </div>
                </div>
            </div>

        )
    }
}

export default DischargeVar