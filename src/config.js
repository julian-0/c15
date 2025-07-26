console.log(`Wndow.APP_VARIANT: ${window.APP_VARIANT}`);

export function getAppVariant() {
  return window.APP_VARIANT || 'full';
//   return 'lite';
}

export function isLiteVersion() {
  return getAppVariant() === 'lite';
}