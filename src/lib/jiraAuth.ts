export function createBasicAuthHeader(username = '', apiToken = '') {
  const value = `${username}:${apiToken}`;
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `Basic ${btoa(binary)}`;
}

