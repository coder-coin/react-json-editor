export function getDefaultID() {
  return `key-${window.crypto.randomUUID().split('-')[0]}`;
}
