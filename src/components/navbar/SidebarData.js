import React from "react";
import * as BsIcons from 'react-icons/bs'
import * as LiaIcons from 'react-icons/lia'
import * as AiIcons from 'react-icons/ai'


export const SidebarData = [
    {
        title: "Control",
        path: "/discharge",
        icon: <BsIcons.BsLightningCharge/>,
        cName: "nav-text"
    },
    {
        title: "CPU",
        path: "/cpu",
        icon: <BsIcons.BsCpu/>,
        cName: "nav-text"
    },
    {
        title: "ECG",
        path: "/ecg",
        icon: <LiaIcons.LiaHeartbeatSolid/>,
        cName: "nav-text"
    },
    {
        title: "Audio",
        path: "/audio",
        icon: <AiIcons.AiOutlineSound/>,
        cName: "nav-text"
    }
]