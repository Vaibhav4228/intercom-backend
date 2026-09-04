
import express, { Router } from 'express'
import cors from 'cors'
import { Express, Response, Request } from "express";
import path from 'node:path';
import { handleExpressError } from '../exceptions/handleExpressError';
import { apiV1 } from '@/routes/apiV1';

export function expressServer(app: Express, PORT: number) {
    const router = Router()

    app.use(
        cors({
            origin: function (origin, callback) {
                // allow requests without origin (Postman, server-to-server)
                if (!origin) {
                    return callback(null, true);
                }
                // allow your frontend
                if (origin === process.env.FRONT_APP_URL) {
                    return callback(null, true);
                }
                // allow embedded websites
                return callback(null, true);
            },
            credentials: true,
        })
    );

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use('/assets', express.static(path.join(process.cwd(), 'public')));
    app.use(handleExpressError)


    app.get('/', async (req: Request, res: Response) => {
        res.json({ message: "server is up" })
    })

    // API v1
    apiV1(app, router)



    app.listen(PORT, () => {
        console.log(`Express server is running at http://localhost:${PORT}`)
    })
}


