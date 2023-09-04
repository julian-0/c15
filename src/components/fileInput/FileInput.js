import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import './FileInput.css';

const FileInput = ({ targetConnected, parentCallback }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        parentCallback(file.path);
    };

    return (
        <div className="file-input">
            <div className='logo-container'>
                <label htmlFor="upload" className="upload-label">
                    <FaUpload className="upload-icon" />
                </label>
            </div>
            <input
                type="file"
                id="upload"
                className="input"
                onChange={handleFileChange}
                hidden
                disabled={!targetConnected}
            />
            <label htmlFor="upload" className='file-label text-secondary-emphasis'>{!selectedFile ? 'Archivo .efl' : selectedFile.name}</label>
        </div>
    );
};

export default FileInput;
