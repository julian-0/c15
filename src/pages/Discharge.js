//Download component
import React, { useState } from 'react';
import Programmer from '../components/programmer/Programmer';
import './Discharge.css';
import DischargeVar from '../components/dischargeVar/DischargeVar';
import { isLiteVersion } from '../config.js'

function Discharge() {
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
                        {!lite && <DischargeVar targetReadable={targetReadable} />}
                        <Programmer target={'STM32L431VCTx'} targetReadable={targetReadable} 
                                    updateTargetState={updateTargetState} showVersion={lite ? false : true}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discharge