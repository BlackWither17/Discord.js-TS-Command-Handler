import { ActivityType, Events } from "discord.js";
import client from "../index.js";
import logger from "../shared/logger.js";

client.on(Events.ClientReady, () => {
    const activities = [
        { name: "/help", type: ActivityType.Listening },
    ];

    let i = 0;
    setInterval(() => {
        if(i >= activities.length) {i = 0;}
        client.user?.setActivity(activities[i]);
        i++;
    }, 5000);

    client.user?.setStatus("online");
    logger.success(`Logged in as ${client.user?.tag}!`);
});
