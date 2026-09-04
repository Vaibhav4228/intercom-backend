import { sendEmail } from "@/email/email.notifcation";
import amqp from "amqplib";


let channel: amqp.Channel;


export async function connectRabbitMQ(): Promise<void> {
    const rabbitUrl = process.env.RabbitMQ_URL;

    if (!rabbitUrl) {
        console.error("RabbitMQ Error: RabbitMQ_URL environment variable is missing.");
        process.exit(1);
    }

    try {
        console.log("Connecting to RabbitMQ...");
        const connection = await amqp.connect(rabbitUrl);

        connection.on("error", (err) => {
            console.error("RabbitMQ connection runtime error:", err.message);
        });

        connection.on("close", () => {
            console.error("RabbitMQ connection closed! Exiting application...");
            process.exit(1);
        });

        channel = await connection.createChannel();


        await channel.assertExchange("user.events", "topic", {
            durable: true,
        });



        // Define a queue
        const queue = await channel.assertQueue("email.notifications", {
            durable: true
        });
        //bind an event to the queue
        await channel.bindQueue(queue.queue, "user.events", "user.created");

        channel.consume(queue.queue, async (msg:any) => {
            if (!msg) return;

            const data = JSON.parse(msg.content.toString());
            await sendEmail(data?.email,data?.otpCode)
            console.log( "Sending email:", data.email  );
            // send email here
            channel.ack(msg);

        });
        console.log("RabbitMQ connected and exchange asserted.");
    } catch (error: any) {
        console.error("Failed to initialize RabbitMQ:", error?.message || error);

        process.exit(1);
    }
}




