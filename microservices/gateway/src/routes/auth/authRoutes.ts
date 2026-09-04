import { loginUsergRPC, registerUsergRPC, verifyUserEmailgRPC } from "@/app/bootstrap/grpc/gRPCAuthClient";
import { Router } from "express";



export function authRoutes(router: Router) {
    router.post('/register', registerUsergRPC)
    router.post('/verify-email', verifyUserEmailgRPC)
    router.post('/login', loginUsergRPC)

    return router
}