import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang = localStorage.getItem("lang") || "en";

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        lng: savedLang,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    programer: "Programer",
                    step: "Step {{number}}",
                    serialNumber: "Serial number",
                    microcontroller: "Microcontroller",
                    disconnected: "Disconnected",
                    connected: "Connected",
                    disconnect: "Disconnect",
                    connect: "Connect",
                    model: "Model",
                    firmVersion: "Firmware version",
                    elfFile: ".elf file",
                    flash: "Flash",
                    halt: "Halt",
                    reset: "Reset",
                    resume: "Resume",
                },
            },
            es: {
                translation: {
                    programer: "Programador",
                    step: "Paso {{number}}",
                    serialNumber: "Nº de serie",
                    microcontroller: "Microcontrolador",
                    disconnected: "Desconectado",
                    connected: "Conectado",
                    disconnect: "Desconectar",
                    connect: "Conectar",
                    model: "Modelo",
                    firmVersion: "Versión del firmware",
                    elfFile: "Archivo .elf",
                    flash: "Grabar",
                    halt: "Pausar",
                    reset: "Reiniciar",
                    resume: "Reaunudar",
                },
            },
            zh: {
                translation: {
                    programer: "程序员",
                    step: "步骤 {{number}}",
                    serialNumber: "序列号",
                    microcontroller: "微控制器",
                    disconnected: "未连接",
                    connected: "已连接",
                    disconnect: "断开连接",
                    connect: "连接",
                    model: "型号",
                    firmVersion: "固件版本",
                    elfFile: ".elf 文件",
                    flash: "烧录",
                    halt: "暂停",
                    reset: "重置",
                    resume: "继续",
                },
            },
            // Add more languages here
        },
    });

export default i18n;