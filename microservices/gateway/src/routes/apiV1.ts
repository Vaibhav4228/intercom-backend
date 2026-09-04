import { Router ,Express} from "express";
import { authRoutes } from "./auth/authRoutes";
import { taskRoutes } from "./task/taskRoutes";



export function apiV1(app:Express,router:Router){
    const auth=authRoutes(router)
    const task=taskRoutes(router)

    app.use('/api/v1',auth,task)

}