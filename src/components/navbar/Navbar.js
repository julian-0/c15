import React from 'react'
import { Link } from 'react-router-dom'
import { SidebarData } from './SidebarData'
import './Navbar.css'
import { IconContext } from 'react-icons'
import eymLogo from '../../imgs/eym.png'

function Navbar() {
    return (
        <div className='menu'>
            <IconContext.Provider value={{ color: '#fff' }}>
                <nav className="nav-menu active">
                    <ul className="nav-menu-items">
                        <li className="navbar-home">
                            <Link to="/" className="menu-bars">
                                <img src={eymLogo} alt="eym logo" className="eym-logo" />
                            </Link>
                        </li>
                        {SidebarData.map((item, index) => {
                            return (
                                <li
                                    key={index} 
                                    className={item.cName}>
                                    <Link to={item.path}>
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