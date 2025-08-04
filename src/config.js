const electron = window.require('electron');
var appName = electron.remote.app.getName();

console.log(`Wndow.APP_VARIANT: ${window.APP_VARIANT}`);

export function getAppVariant() {
    //   return window.APP_VARIANT || 'full'; 
    if (appName.toLowerCase().includes('lite'))
        return 'lite';
    else
        return 'full';
}

export function isLiteVersion() {
    return getAppVariant() === 'lite';
    // return true;
}