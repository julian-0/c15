//Download component
import React, { useState } from 'react';
import Programmer from '../components/programmer/Programmer';
//import './Cpu.css';
import CpuVar from '../components/cpuVar/CpuVar';
import { isLiteVersion } from '../config';

function Cpu() {
    const [targetReadable, setTargetReadable] = useState(false);

    const updateTargetState = (newState) => {
        setTargetReadable(newState);
    };

    const lite = isLiteVersion(); 

    return (
        <div className="h100 container text-center d-flex flex-column">
            <div className='row flex-grow-1 mt-1'>
                <div className='container'>
                    <div className='row d-flex align-items-center justify-content-around'>
                        {!lite && <CpuVar targetReadable={targetReadable} />}
                        <Programmer target={'STM32F429IITx'} targetReadable={targetReadable} updateTargetState={updateTargetState} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cpu