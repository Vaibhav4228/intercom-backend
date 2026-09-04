import { NextFunction, Response, Request } from "express";
import jwt from 'jsonwebtoken'
import mongoose, { Types } from "mongoose";

function jwtPayload(userId: Types.ObjectId) {
  const payload = {
    iss: "auth-service",
    // Subject : the authenticated user.
    sub: userId,
    // which service should accept the token.
    aud: "gateway-service",

    exp: Math.floor(Date.now() / 1000) + 60 * 60,   // 1hour
    iat: Math.floor(Date.now() / 1000),

  };

  return payload;
}



export function signAccessToken(userId: Types.ObjectId) {
  const payload = jwtPayload(userId)
  const key = process.env.JWT_TOKEN_KEY as string
  return new Promise((resolve, reject) => {
    (jwt as any).sign(payload, key, (error: Error, token: string) => {
      if (error) {
        reject(error)
      }
      resolve(token)
    })
  })
}


export function signRefreshToken(userId: Types.ObjectId) {
  const payload = jwtPayload(userId)
  const key = process.env.REFRESH_TOKEN_KEY as string
  return new Promise((resolve, reject) => {
    jwt.sign(payload, key, (error, token) => {
      if (error) {
        reject(error)
      }
      resolve(token)
    })
  })
}


