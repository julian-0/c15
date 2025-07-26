import React from "react";
import * as BsIcons from 'react-icons/bs'
import * as LiaIcons from 'react-icons/lia'
import * as AiIcons from 'react-icons/ai'


export const SidebarData = [
    {
        title: "Control",
        liteTitle: "Step 1",
        path: "/discharge",
        icon: <BsIcons.BsLightningCharge/>,
        cName: "nav-text"
    },
    {
        title: "CPU",
        liteTitle: "Step 2",
        path: "/cpu",
        icon: <BsIcons.BsCpu/>,
        cName: "nav-text"
    },
    {
        title: "ECG",
        liteTitle: "Step 3",
        path: "/ecg",
        icon: <LiaIcons.LiaHeartbeatSolid/>,
        cName: "nav-text"
    },
    {
        title: "Audio",
        liteTitle: "Step 4",
        path: "/audio",
        icon: <AiIcons.AiOutlineSound/>,
        cName: "nav-text"
    }
]