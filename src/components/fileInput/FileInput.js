import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import './FileInput.css';
import { useTranslation } from "react-i18next";


const FileInput = ({ targetConnected, parentCallback }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const { t } = useTranslation();
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        parentCallback(file.path);
    };

    useEffect(() => {
        // Cuando targetConnected cambia a false, limpiamos el selectedFile
        if (!targetConnected) {
            setSelectedFile(null);
        }
    }, [targetConnected]);

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
                onClick={(event) => {
                    event.target.value = null
                }}
            />
            <label htmlFor="upload" className='file-label text-secondary-emphasis'>{!selectedFile ? t('elfFile') : selectedFile.name}</label>
        </div>
    );
};

export default FileInput;
