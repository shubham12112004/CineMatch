import net from 'net';

export function findAvailablePort(startPort, host = '0.0.0.0', maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryPort = (port) => {
      const tester = net.createServer();

      tester.once('error', (err) => {
        tester.close();
        if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
          attempts += 1;
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });

      tester.once('listening', () => {
        tester.close(() => resolve(port));
      });

      tester.listen(port, host);
    };

    tryPort(startPort);
  });
}
