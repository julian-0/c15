//Download component
import React from 'react';
import Programmer from '../components/programmer/Programmer';
import './Discharge.css';
import DischargeVar from '../components/dischargeVar/DischargeVar';

function Discharge() {
    return (
        <div className="discharge col text-center">
            <h1 className='align-self-start'>Descarga</h1>
            <div className='h-100'>
                <div className='h-100 d-flex align-items-center justify-content-around'>
                    <DischargeVar />
                    <Programmer />
                </div>
            </div>
        </div>
    )
}

export default Discharge