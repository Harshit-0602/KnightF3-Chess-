const redis = require("redis");

// We will now manage two separate, persistent client instances.
let commandClient = null;
let subscriberClient = null;

/**
 * Connects to Redis and creates two clients:
 * 1. A command client for regular operations (HSET, HGETALL).
 * 2. A dedicated subscriber client for Pub/Sub.
 */
async function connect() {
    // If both clients are already connected, we can skip this.
    if (commandClient && subscriberClient) {
        return;
    }

    console.log("Connecting to Redis...");

    try {
        // 1. Create and connect the primary client for regular commands.
        const mainClient = redis.createClient();
        mainClient.on("error", err => console.error("Redis Command Client Error:", err));
        await mainClient.connect();
        commandClient = mainClient;

        // 2. Create a dedicated duplicate client for subscribing.
        // This is the standard pattern as a subscribed client cannot issue other commands.
        subscriberClient = commandClient.duplicate();
        subscriberClient.on("error", err => console.error("Redis Subscriber Client Error:", err));
        await subscriberClient.connect();

        console.log("Both Redis command and subscriber clients connected successfully.");

    } catch (error) {
        console.error("Failed to connect one or more Redis clients:", error);
        // Ensure we clean up properly on a partial or full connection failure.
        if (commandClient) await commandClient.quit().catch(e => console.error(e));
        if (subscriberClient) await subscriberClient.quit().catch(e => console.error(e));
        commandClient = null;
        subscriberClient = null;
    }
}

/**
 * Returns the client instance used for sending commands (HSET, HGETALL, etc.).
 */
function getCommandClient() {
    if (!commandClient) {
        throw new Error("Redis command client is not connected. Call connect() at server startup.");
    }
    return commandClient;
}

/**
 * Returns the client instance used ONLY for subscribing to Pub/Sub channels.
 */
function getSubscriberClient() {
    if (!subscriberClient) {
        throw new Error("Redis subscriber client is not connected. Call connect() at server startup.");
    }
    return subscriberClient;
}

module.exports = { connect, getCommandClient, getSubscriberClient };

