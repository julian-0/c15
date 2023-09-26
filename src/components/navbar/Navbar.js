import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SidebarData } from './SidebarData'
import './Navbar.css'
import { IconContext } from 'react-icons'
import eymLogo from '../../imgs/eym.png'

function Navbar() {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');

    const handleClick = (title) => {
        setActiveItem(title);
    }

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
                            return (
                                <li
                                    key={index} 
                                    className={item.cName}
                                    onClick={() => handleClick(item.title)}>
                                    <Link to={item.path} className={className}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </div>
    )
}

export default Navbar