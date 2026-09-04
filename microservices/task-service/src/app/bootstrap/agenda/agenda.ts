import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import { runJobs } from "./jobs/docEmbeddingJob";
import mongoose from "mongoose";

// const backend = new MongoBackend({
//   address: process.env.DB_URL!,
//   collection: "jobs",
// });

// export const agenda = new Agenda({
//   backend,
// });

export let agenda: Agenda;

export async function initAgenda() {
  try {
    // 1. Ensure Mongoose driver is ready before using it
    if (!mongoose.connection.db) {
      throw new Error("Mongoose connection is not ready yet!");
    }

    console.log("Configuring Agenda to reuse existing Mongoose connection...");

    // 2. Instantiate backend using the active Mongoose connection pool
    const backend = new MongoBackend({
      mongo: mongoose.connection.db as any, // Uses existing open connection sockets
      collection: "jobs",
    });

    // 3. Initialize Agenda instance
    agenda = new Agenda({
      backend,
      processEvery: "5 seconds",
      maxConcurrency: 10,
      defaultConcurrency: 5,
    });
    agenda.on("ready", () => {
      console.log("🟢 Agenda ready");
    });

    agenda.on("start", (job) => {
      console.log("▶️ Job started:", job.attrs.name);
    });

    agenda.on("complete", (job) => {
      console.log("✅ Job completed:", job.attrs.name);
    });

    agenda.on("fail", (err, job) => {
      console.error(
        "❌ Job failed:",
        job?.attrs?.name,
        err
      );
    });

    agenda.on("error", (err) => {
      console.error("❌ Agenda error:", err);
    });

    await agenda.start();
    runJobs(agenda);


    console.log("✅ Agenda connected and queue processing started");
  } catch (err: any) {
    console.error("❌ Agenda failed:", err?.message);
    throw err; // Propagate error up to trigger process.exit(1) in bootStrapApp
  }
}
