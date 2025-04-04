import Express, { type Response } from 'express'
import { type AuthenticatedUsedData, withAuth } from './middlewares/authMiddleware.ts'

const env = {
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4052'
}
if (!env.AUTH_SERVICE_URL) throw new Error('Missing AUTH_SERVICE_URL')

const app = Express()

app.use(Express.json())

app.get('/public', (req, res) => {
    res.json({
        message: 'This is a public route'
    })
})

app.get('/private', withAuth({
    env
}), (req, res: Response<any, { userData: AuthenticatedUsedData }>) => {
    res.json({
        message: 'This is a private route',
        user: res.locals.userData
    })
})

app.listen(3000, () => console.log('Internal API listening on 3000'))
