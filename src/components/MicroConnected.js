import { Component } from 'react'

const electron = window.require('electron');
const { ipcRenderer } = electron;
const loadBalancer = window.require('electron-load-balancer');

export class MicroConnected extends Component {

    static toastProperties = {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        pauseOnFocusLoss: false
    };

    sendToMicro(command, source, body = {}) {
        body.command = command;
        body.source = source;
        loadBalancer.sendData(
            ipcRenderer,
            'controller',
            body
        );
    }

    render() {
        return null
    }
}

export default MicroConnected