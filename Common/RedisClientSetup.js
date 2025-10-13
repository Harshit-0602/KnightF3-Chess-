const redis = require("redis");

let client = null; // Start with a null client

async function connect() {
    if (client) return client; // If already connected, return the client

    client = redis.createClient();
    client.on("error", err => console.log("Redis Client Error = " + err));
    
    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error("Redis Client Connection Error = " + error);
        client = null; // Reset client on failure
        return null;
    }
}

function getClient() {
    if (!client) {
        throw new Error("Redis client is not connected. Call connect() at server startup.");
    }
    return client;
}

module.exports = { connect,getClient };