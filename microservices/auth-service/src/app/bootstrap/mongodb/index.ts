import mongoose from "mongoose";


export async function dbConnection() {

  mongoose
    .connect(process.env.DB_URL as string)
    .then(() => console.log("Connected!"))
    .catch((error) => console.log("Db connection Error !",(error)?.message));
}


