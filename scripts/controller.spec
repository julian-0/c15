# -*- mode: python ; coding: utf-8 -*-
#

from PyInstaller.utils.hooks import get_package_paths, collect_entry_point, copy_metadata, collect_all
from PyInstaller.__main__ import run

datas_probe, hiddenimports_probe = collect_entry_point('pyocd.probe')
datas_rtos, hiddenimports_rtos = collect_entry_point('pyocd.rtos')

pyocd_path = get_package_paths('pyocd')[1]
cmsis_path = "..\\.\\venv\\Lib\\site-packages\\cmsis_pack_manager"
pylink_path = get_package_paths('pylink')[1]

managed_packs_path = "pythonUtils\\managed_packs"

datas = [(pyocd_path, 'pyocd/.'),
         (cmsis_path, 'cmsis_pack_manager/.'),
         (pylink_path, 'pylink/.'),
         (managed_packs_path, 'managed_packs/.')]
datas = datas + datas_probe + datas_rtos
hiddenimports = hiddenimports_probe + hiddenimports_rtos

a = Analysis(
    ['controller.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    name='controller',
    debug=False,
    strip=False,
    upx=True,
    console=True,  # Change to False if you want no console to appear
    icon=None,  # Add path to .ico file here if you want a custom icon
    upx_exclude=[],
    runtime_tmpdir='c15_cache',
    bootloader_ignore_signals=False
)

if __name__ == '__main__':
    # Use PyInstaller directly to handle the build as a one-dir if desired:
    run([
        '--name=%s' % exe.name,
        '--onefile',
        '--noconfirm',
        '--log-level=INFO',
        'controller.py'
    ])