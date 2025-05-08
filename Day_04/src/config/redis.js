const {createClient} = require("redis"); 

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST_ID,
        port: 14338
    }
});

module.exports = redisClient;