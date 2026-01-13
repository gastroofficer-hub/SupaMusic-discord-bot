require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'play',
        description: 'Přehraj hudbu',
        options: [{ name: 'query', type: 3, description: 'Píseň/URL', required: true }]
    },
    { name: 'skip', description: 'Přeskoč' },
    { name: 'stop', description: 'Zastav' },
    { name: 'queue', description: 'Fronta' }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(Routes.applicationCommands('InsertApplicationIDhere'), { body: commands })
    .then(() => console.log('Global příkazy!'))
    .catch(console.error);
