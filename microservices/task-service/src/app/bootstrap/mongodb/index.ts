import mongoose from "mongoose";


// export async function dbConnection() {

//   mongoose
//     .connect(process.env.DB_URL as string)
//     .then(() => console.log("Connect to mongodb !"))
//     .catch((error) => console.log("Db connection Error !",(error)?.message));
// }



// Cache the connection pointer
let isConnected = false;

export async function dbConnection() {
  if (isConnected) {
    console.log("Using existing MongoDB connection.");
    return;
  }

  try {
    const options = {
      autoIndex: true,         // Build indexes on startup
      maxPoolSize: 50,         // Maintain up to 50 socket connections
      minPoolSize: 10,         // Keep at least 10 connections open
      connectTimeoutMS: 5000,  // Give up initial connect after 5 seconds
      socketTimeoutMS: 45000,  // Close inactive sockets after 45 seconds
    };

    console.log("Connecting to MongoDB...");
    // Crucial: Use await to hold execution until connected
    await mongoose.connect(process.env.DB_URL as string, options);
    
    isConnected = true;
    console.log("Successfully connected to MongoDB!");
  } catch (error: any) {
    console.error("DB connection Error:", error?.message);
    process.exit(1); // Exit process so Docker can restart the container
  }
}

