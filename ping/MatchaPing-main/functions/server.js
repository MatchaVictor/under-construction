// functions/server.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Fix import for node-fetch

const app = express();
app.use(cors());

const botToken = process.env.DISCORD_BOT_TOKEN;
const userId = '434790190809350165';

const client = new Client({ intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds] });

let activityStatus = 'Loading...';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.on('presenceUpdate', (oldPresence, newPresence) => {
        if (newPresence.userId === userId) {
            if (newPresence.activities.length > 0) {
                activityStatus = newPresence.activities[0].name; // Get the first activity's name
            } else if (newPresence.presence?.activities[0]?.state) { // Check for custom status
                activityStatus = newPresence.presence.activities[0].state; // Get custom status text
            } else {
                activityStatus = 'No Activity';
            }
        }
    });
});

console.log("Bot Token:", botToken); // Add this line for debugging

client.login(botToken).catch(error => {
    console.error('Error logging in:', error);
});

client.login(botToken).catch(error => {
    console.error('Error logging in:', error);
});

app.get('/.netlify/functions/server/activity', (req, res) => {
    if (!client.user) {
        return res.status(500).json({ error: 'Bot is not logged in' });
    }
    res.json({ activity: activityStatus });
});

// New endpoint for Discord status proxy (updated with presences=true)
app.get('/.netlify/functions/server/discord-status', async (req, res) => {
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}?presences=true`, { // Add ?presences=true
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API returned status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching Discord status:', error);
        res.status(500).json({ error: 'Failed to fetch Discord status' });
    }
});

module.exports.handler = serverless(app);
