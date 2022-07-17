import https from 'https';
import fs from 'fs';
import path from 'path';

export async function getVersionInfo(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get('https://registry.npmjs.org/keysi', (res) => {
      let data = '';

      res.on('data', (buffer: Buffer) => {
        data += buffer.toString();
      });

      res.on('error', () => {
        reject();
      });

      res.on('end', () => {
        try {
          const result: { ['dist-tags']: { latest: 'string ' } } =
            JSON.parse(data);
          resolve(result['dist-tags'].latest);
        } catch (error) {
          reject();
        }
      });
    });

    request.on('error', () => {
      reject();
    });
  });
}

export function getCurrentVersionInfo(): string {
  const packageJson = fs.readFileSync(path.join(__dirname, '../package.json'));
  const packageObject = JSON.parse(packageJson as any) as { version: string };
  return packageObject.version;
}
