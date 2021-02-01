function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  if (navigator.userAgent.indexOf('emulate-ios') !== -1) {
    console.warn('[VUE-SDK]: PLATFORM is being emulated as IOS')
    return 'IOS'
  }
  if (window.parent !== window.self) {
    return 'CONNECT'
  }
  if (/windows phone/i.test(userAgent)) {
    return 'WINDOWS'
  }
  if (/windows/i.test(userAgent)) {
    return 'WINDOWS'
  }
  if (/android/i.test(userAgent)) {
    return 'ANDROID'
  }
  if (/iPad|iPhone|iPod|AppleWebKit/.test(userAgent) && !window.MSStream) {
    return 'IOS'
  }
  return 'unknown'
}

export const PLATFORM = getMobileOperatingSystem()
