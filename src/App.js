import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'
import Navbar from './components/navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import Discharge from './pages/Discharge';
import Cpu from './pages/Cpu';
import Ecg from './pages/Ecg';
import Audio from './pages/Audio';

// Electron related imports
const electron = window.require('electron');
const { ipcRenderer } = electron;
const loadBalancer = window.require('electron-load-balancer');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // 1. Starting preemptive loop as soon as app starts
    console.log("preemptive loop started")
    loadBalancer.start(ipcRenderer, 'preemptive_loop');
    loadBalancer.start(ipcRenderer, 'controller');
  }

  componentWillUnmount() {
    // 2. Shutdown preemptive loop before app stops
    loadBalancer.stop(ipcRenderer, 'preemptive_loop');
    loadBalancer.stop(ipcRenderer, 'controller');
  }

  render() {
    return (
      <>
        <Router>
          <Navbar />
          <div className="content d-flex align-items-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discharge" element={<Discharge />} />
              <Route path="/cpu" element={<Cpu />} />
              <Route path="/ecg" element={<Ecg />} />
              <Route path="/audio" element={<Audio />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer />
      </>
    );
  }
}

export default App;
