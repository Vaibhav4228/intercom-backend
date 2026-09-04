
import 'dotenv/config'
import { bootStrapApp } from './app/bootstrap/index'


export const PORT=parseInt(process.env.PORT as string)

bootStrapApp()

