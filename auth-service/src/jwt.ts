import jose from 'node-jose'
import { mkdir, readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";

export async function setUpJWKSKeyStore(keyPath: string = './.jose', keyLength: number = 2048) {
    await mkdir(keyPath, { recursive: true });
    const fullKeyPath = join(resolve(keyPath), 'keys.json');
    const existingKeys = await readFile(fullKeyPath, 'utf-8').catch(() => null);
    let keyStore: jose.JWK.KeyStore | null = null;
    if (existingKeys) {
        keyStore = await jose.JWK.asKeyStore(existingKeys);
    } else {
        keyStore = jose.JWK.createKeyStore();
        await keyStore.generate('RSA', keyLength, { alg: 'RS256', use: 'sig' });
        await writeFile(fullKeyPath, JSON.stringify(keyStore.toJSON(true), null, 2), {
            flag: 'w+',
        });
    }
    return keyStore;
}

export async function signJWT(
    payload: {
        sub: string
        exp?: number
        iss?: string
        aud?: string
    },
    keyStore: jose.JWK.KeyStore
) {
    const [signKey] = keyStore.all({ use: 'sig' })
    if (!signKey) throw new Error('Cannot locate signing key')
    const signer = jose.JWS.createSign({ format: 'compact', fields: { typ: 'jwt' } }, signKey)
    const signed = signer.update(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), iss: 'auth-service', aud: 'internal-services' }))
    // Existe um bug nesse tipo, quando o formato é 'compact' o retorno não é um objeto, mas o JWT direto
    return signed.final() as unknown as Promise<string>

}
