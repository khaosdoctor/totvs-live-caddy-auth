import { hash } from 'node:crypto'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { setUpJWKSKeyStore, signJWT } from './jwt.ts'
const app = new Hono()

const users = new Map([['123456', { name: 'Lucas' }], ['999999', { name: 'Bill' }]])

type CacheValue = {
    jwt: string,
    user: string
}

const cache: Map<string, CacheValue> = new Map()
const keyStore = await setUpJWKSKeyStore()

function updateCache(jwt: string, userName: string, keyHash: string) {

    setTimeout(() => {
        console.info(`Deleting key ${keyHash}`)
        cache.delete(keyHash)
    }, 60 * 1000)

    return cache.set(keyHash, {
        jwt,
        user: userName
    }).get(keyHash) as CacheValue
}

async function createJWT(keyData: { name: string }) {
    // 5 mins
    const expirationTime = Math.floor(Date.now() / 1000) + 300
    const payload = {
        sub: keyData.name,
        iss: 'auth-service',
        aud: 'internal-services',
        iat: Date.now(),
        typ: 'key',
        exp: expirationTime
    }

    return signJWT(payload, keyStore)
}

app.get('/.well-known/jwks.json', (c) =>
    c.json(keyStore.toJSON())
)

app.get('/gateway/auth', async (c) => {
    try {
        const authorizationHeader = c.req.header('Authorization')
        console.log({ authorizationHeader })
        if (!authorizationHeader) {
            c.status(401)
            return c.json({
                message: 'Missing authorization header'
            })
        }

        const [protocol, plainKey] = authorizationHeader.split(' ') as [string, string]
        console.log({ protocol, plainKey })
        if (!protocol || protocol.toLowerCase() !== 'key') {
            c.status(403)
            return c.json({
                message: 'Invalid protocol'
            })
        }

        const keyHash = hash('sha256', plainKey)
        let cachedJwt = cache.get(keyHash)
        console.log({ cachedJwt })

        if (!cachedJwt) {
            const keyData = users.get(plainKey)
            console.log({ keyData })
            if (!keyData) {
                c.status(401)
                return c.json({
                    message: 'Invalid key'
                })
            }

            const jwt = await createJWT(keyData)
            cachedJwt = updateCache(jwt, keyData.name, keyHash)
        }

        c.header('on-behalf-of', cachedJwt.jwt)
        c.status(204)
        return c.body(null)

    } catch (error) {
        console.error(error)
        c.status(500)
        c.json({
            message: 'Internal error'
        })
    }
})

serve({ fetch: app.fetch, port: 4052 }, (i) => console.log(`Listening ${i.port}`))

