import type { NextFunction, Request, Response } from "express";
import jose from 'node-jose'

let cachedKeys: jose.JWK.KeyStore | null = null

export interface AuthMiddlewareOptions {
    env: {
        AUTH_SERVICE_URL: string,
    }
}
export interface AuthenticatedUsedData {
    rawToken: {
        iss: string
        aud: string
        sub: string
        exp: number
        iat: number
    },
    user: string
    issuer: string
}

interface JWKeyList {
    keys: {
        kty: string
        kid: string
        use: string
        alg: string
        e: string
        n: string
    }[]
}

async function verifyJWT(jwt: string) {
    if (!cachedKeys) throw new Error('KeyStore not initialized')
    const verifier = jose.JWS.createVerify(cachedKeys)
    try {
        const result = await verifier.verify(jwt)
        return JSON.parse(result.payload.toString())
    } catch (error) {
        return null
    }
}

async function decodeToken(token: string, env: AuthMiddlewareOptions['env']) {

    if (!cachedKeys) {
        const JWKSResponse = await fetch(`${env.AUTH_SERVICE_URL}/.well-known/jwks.json`)
        if (!JWKSResponse.ok) throw new Error('Could not fetch auth validation key')

        const keyList: JWKeyList = (await JWKSResponse.json()) as JWKeyList
        cachedKeys = await jose.JWK.asKeyStore(keyList)
    }

    return verifyJWT(token)
}

export function withAuth(opts: AuthMiddlewareOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authJWT = req.header('on-behalf-of')
        if (!authJWT) {
            res.status(401)
                .json({
                    message: 'Missing authentication token'
                })
            return
        }

        const decodedToken: AuthenticatedUsedData['rawToken'] = await decodeToken(authJWT, opts.env)

        if (!decodedToken) {
            res.status(401).json({ message: 'Could not decode token' })
            return
        }

        const { aud, sub, iss } = decodedToken
        if (aud !== 'internal-services') return next(new Error('Token not meant for this service'))

        res.locals.userData = {
            rawTokenPayload: decodedToken,
            issuer: iss,
            user: sub
        }

        return next()
    }
}
