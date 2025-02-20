const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events";

async function connectRabbitMq() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected with Rabbimq");
    return channel;
  } catch (error) {
    logger.error("Error to connect RabbitMql");
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectRabbitMq();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );

  logger.info(`EVENT publish :${routingKey}`);
}

module.exports = { connectRabbitMq, publishEvent };
