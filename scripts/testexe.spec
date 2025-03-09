# -*- mode: python ; coding: utf-8 -*-
#
# Custom spec file for pyinstaller DO NOT CALL pyinstaller DIRECTLY
# Instead use the package_to_exe.py script provided which will also copy all other files needed
#

from PyInstaller.utils.hooks import get_package_paths, collect_entry_point, copy_metadata, collect_all

datas_probe, hiddenimports_probe = collect_entry_point('pyocd.probe')
datas_rtos, hiddenimports_rtos = collect_entry_point('pyocd.rtos')
datas_targets, hiddenimports_targets = collect_entry_point('pyocd.targets')


pyocd_path = get_package_paths('pyocd')[1]
cmsis_path = "..\\.\\venv\\Lib\\site-packages\\cmsis_pack_manager"
pylink_path = get_package_paths('pylink')[1]

datas = [(pyocd_path, 'pyocd/.'),
         (cmsis_path, 'cmsis_pack_manager/.'),
         (pylink_path, 'pylink/.')]
datas = datas + datas_probe + datas_rtos + datas_targets
hiddenimports = hiddenimports_probe + hiddenimports_rtos  + hiddenimports_targets

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
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    #exclude_binaries=True,
    name='controller',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    #disable_windowed_traceback=False,
    #argv_emulation=False,
    #target_arch=None,
    #codesign_identity=None,
    #entitlements_file=None,
)
#coll = COLLECT(
#    exe,
#    a.binaries,
#    a.datas,
#    strip=False,
#    upx=True,
#    upx_exclude=[],
#    name='controller',
#)
