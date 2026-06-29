const mqtt = require("mqtt");
const axios = require("axios");
require("dotenv").config();

const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_PORT = process.env.MQTT_PORT;

const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const STATUS_TOPIC =
"fridge_8A7D31E9B4C2F6A55D9E1C77A2F0B3D91C4E7F8A2D5B6C1E3F9A8D7C4B2E1F6/status";

const client = mqtt.connect({
    host: MQTT_HOST,
    port: Number(MQTT_PORT),
    protocol: "mqtts",
    username: MQTT_USER,
    password: MQTT_PASS,
    reconnectPeriod: 3000,
    clean: true
});

async function sendTelegram(message)
{
    try
    {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
                chat_id: CHAT_ID,
                text: message
            }
        );

        console.log("Telegram Sent");
    }
    catch(err)
    {
        console.log(err.message);
    }
}

client.on("connect", () =>
{
    console.log("Connected To HiveMQ");

    client.subscribe(
        STATUS_TOPIC,
        (err)=>
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Subscribed");
            }
        });
});

client.on("reconnect",()=>
{
    console.log("Reconnecting...");
});

client.on("error",(err)=>
{
    console.log(err.message);
});

client.on("message",(topic,message)=>
{
    const msg = message.toString();

    console.log(topic,msg);

    if(msg==="offline")
    {
        sendTelegram(
`🚨 Refrigerator Offline

ESP32 disconnected from MQTT.

Possible reason:
⚡ Power Failure
📶 WiFi Lost
💥 ESP Restart`);
    }

    if(msg==="online")
    {
        sendTelegram(
`✅ Refrigerator Online

ESP32 connected successfully.`);
    }
});
