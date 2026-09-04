import { Express, Response, Request } from "express";
import { expressServer } from "./express/expressServer";
import { startWebSocketServer } from "./websocket/websocketServer";

export function bootStrapApp(app: Express, PORT: number){
   try {
     expressServer(app, PORT)
     startWebSocketServer()
   } catch (error) {
    console.log('Failed to start express server : '+(error as Error)?.message)
    process.exit(1);
   }
}

