import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SidebarData } from './SidebarData'
import './Navbar.css'
import { IconContext } from 'react-icons'
import { GrLanguage } from "react-icons/gr";
import eymLogo from '../../imgs/eym.png'
import { isLiteVersion } from '../../config.js'
import { LANGUAGES } from "../../utils/constants.js";
import { useTranslation } from "react-i18next";
const electron = window.require('electron');
var appVersion = electron.remote.app.getVersion(); 

function Navbar() {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');
    const { i18n, t } = useTranslation();

    const onChangeLang = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    }

    const handleClick = (title) => {
        setActiveItem(title);
    }

    const lite = isLiteVersion(); 

    return (
        <div className='menu'>
            <IconContext.Provider value={{ color: '#fff' }}>
                <nav id='sidebar' className="nav-menu">
                    <ul className="nav-menu-items">
                        <li className="navbar-home">
                            <Link to="/" className="menu-bars" onClick={() => handleClick('')}>
                                <img src={eymLogo} alt="eym logo" className="eym-logo" />
                            </Link>
                        </li>
                        {SidebarData.map((item, index) => {
                            const isActive = item.title === activeItem || item.path === location.pathname;
                            const className = isActive ? 'active' : '';
                            return (<>
                                {lite && item.superiorTitle && <span className="superior-title">{item.superiorTitle}</span>}
                                <li
                                    key={index} 
                                    className={item.cName}
                                    onClick={() => handleClick(item.title)}>
                                    <Link to={item.path} className={className}>
                                        {item.icon}
                                        <span>{lite ? t("step", {number: item.stepNumber}) : item.title}</span>
                                    </Link>
                                </li>
                                </>
                            );
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>

            <footer className="fixed-bottom mx-1" >
                {lite && <div>
                    <GrLanguage />
                    <select id='langSelect' className='mx-1' value={i18n.language} onChange={onChangeLang}>
                        {LANGUAGES.map(({ code, label }) => (
                            <option key={code} value={code}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>}
                <div>v{appVersion}{lite? "-lite" : ""}</div>
            </footer>
        </div>
    )
}

export default Navbar