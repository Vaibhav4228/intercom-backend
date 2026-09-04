import { channel } from ".";

export function publishEvent(
    routingKey:string,
    data:any
){

    channel.publish(
        "user.events",
        routingKey,
        Buffer.from(JSON.stringify(data))
    );

}