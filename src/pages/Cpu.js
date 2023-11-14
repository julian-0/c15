//Download component
import React, { useState } from 'react';
import Programmer from '../components/programmer/Programmer';
//import './Cpu.css';
import CpuVar from '../components/cpuVar/CpuVar';

function Cpu() {
    const [targetReadable, setTargetReadable] = useState(false);

    const updateTargetState = (newState) => {
        setTargetReadable(newState);
    };

    return (
        <div className="h100 container text-center d-flex flex-column">
            <div className='row flex-grow-1 mt-1'>
                <div className='container'>
                    <div className='row d-flex align-items-center justify-content-around'>
                        <CpuVar targetReadable={targetReadable} />
                        <Programmer target={'STM32F429IITx'} targetReadable={targetReadable} updateTargetState={updateTargetState} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cpu