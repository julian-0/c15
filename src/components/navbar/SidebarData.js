import React from "react";
import * as BsIcons from 'react-icons/bs'
import * as LiaIcons from 'react-icons/lia'
import * as AiIcons from 'react-icons/ai'


export const SidebarData = [
    {
        title: "Control",
        stepNumber: "1",
        superiorTitle: "SC1902",
        path: "/discharge",
        icon: <BsIcons.BsLightningCharge/>,
        cName: "nav-text"
    },
    {
        title: "CPU",
        stepNumber: "1",
        superiorTitle: "SC1901",
        path: "/cpu",
        icon: <BsIcons.BsCpu/>,
        cName: "nav-text"
    },
    {
        title: "ECG",
        stepNumber: "2",
        path: "/ecg",
        icon: <LiaIcons.LiaHeartbeatSolid/>,
        cName: "nav-text"
    },
    {
        title: "Audio",
        stepNumber: "3",
        path: "/audio",
        icon: <AiIcons.AiOutlineSound/>,
        cName: "nav-text"
    }
]