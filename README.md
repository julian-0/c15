# C15 Config app
Multi-platform application to configure, calibrate and program [C15 Defribillator of E&M electromedicina](https://www.eym.com.ar/index-EN.html).


Works on Windows 10^ and Ubuntu 20.04^

Made with React, ElectronJs and Python

## Demos  
### Discharge  
![descarga](https://github.com/julian-0/c15/assets/42820126/e597b23b-20b1-4cc5-a6e9-1816c350ebde)

### CPU  
![cpu](https://github.com/julian-0/c15/assets/42820126/f3398550-9712-4880-87a9-9b952b910101)

### ECG  
![ecg](https://github.com/julian-0/c15/assets/42820126/438cd6f8-c438-4f51-8c4f-08e88608c47a)

### Audio  
![audio](https://github.com/julian-0/c15/assets/42820126/d3b3d2de-54ec-45ee-a1b2-9b0d246fb368)

## Installing for windows
1. Install stlink driver 
* [Download](https://www.st.com/en/development-tools/stsw-link009.html) (Need ST account)
* Unzip it
* Execute as admin `stlink_winusb_install.bat`
2. [Download C15 exe installer](https://github.com/julian-0/c15/releases/latest)
* Execute it
  
## Development enviroment for windows
1. Install python 3.9.0
* [Download installer](https://www.python.org/ftp/python/3.9.0/python-3.9.0-amd64.exe)
* Execute it
* Select `Add Python 3.9.0 to PATH`
2. [Download](https://github.com/julian-0/c15/blob/main/requirements.txt) `requirements.txt`
3. `pip install -r requirements.txt`
4. Add microcontrollers drivers.
* `py -3.9 -m pyocd pack -u -i stm32l4p5zgtxp`
* `py -3.9 -m pyocd pack -u -i stm32f405rgtx`
5. Activate python virtual enviroment
* `venv\Scripts\activate`
6. Install stlink driver 
* [Download](https://www.st.com/en/development-tools/stsw-link009.html) (Need ST account)
* Unzip it
* Execute as admin `stlink_winusb_install.bat`
7. Unzip c15/scripts/pythonUtils/managed_packs.rar
8. Build python executable
* `cd scripts && pyinstaller controller.spec && cd ..`
> [!IMPORTANT]
> Be sure to use python 3.9.0
9. Start electron app
* `npm start`

## Build installer for windows
### One line builder
* `npm run build-all-windows`
* The installer .exe will be located in `dist` directory

### Two steps builder
1. If you made changes on python script you need to rebuild the executable
* `cd scripts && pyinstaller controller.spec && cd ..`
2. Then pack the entire app
* `npm run build-windows`