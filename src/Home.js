import React from 'react';
import eymLogo from './imgs/eymBlue.png'

// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;
const loadBalancer = window.require('electron-load-balancer');

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='col h-100 d-flex align-items-center text-center'>
                <div className="container">
                    <img src={eymLogo} alt="eym logo" />
                    <h1 className='appName mt-2'>C-15</h1>
                </div>
            </div>
        )
    }
}

export default Home