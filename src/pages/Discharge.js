//Download component
import React, { useState } from 'react';
import Programmer from '../components/programmer/Programmer';
import './Discharge.css';
import DischargeVar from '../components/dischargeVar/DischargeVar';

function Discharge() {
    const [targetReadable, setTargetReadable] = useState(false);

    const updateTargetState = (newState) => {
        setTargetReadable(newState);
    };

    return (
        <div className="discharge container text-center d-flex flex-column">
            <div className='row'>
                <h1 className='align-self-start'>Descarga</h1>
            </div>
            <div className='row flex-grow-1'>
                <div className='container'>
                    <div className='row d-flex align-items-center justify-content-around'>
                        <DischargeVar targetReadable={targetReadable} />
                        <Programmer targetReadable={targetReadable} updateTargetState={updateTargetState} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discharge