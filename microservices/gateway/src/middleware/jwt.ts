
import { NextFunction, Response, Request } from "express";
import jwt from 'jsonwebtoken'

export async function VerifyExpressToken(req: Request, res: Response, next: NextFunction) {
  try {

    const authHeader = req.headers?.authorization as string

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error('Unauthorized')
    }

    const accessToken = authHeader.split(" ")[1];

    const key = process.env.JWT_TOKEN_KEY as string

    jwt.verify(accessToken, key, (error, payload) => {
      if (error) {
        throw new Error('Unauthorized')
      } else {
        next()
      }
    });


  } catch (error) {
    res.status(401).send({ message: "Unauthorized",status:401 });
  }
}


