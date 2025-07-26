import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        lng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    programer: "Programer",
                    step: "Step {{number}}",
                },
            },
            es: {
                translation: {
                    programer: "Programador",
                    step: "Paso {{number}}",
                },
            },
            // Add more languages here
        },
    });

export default i18n;