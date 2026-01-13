require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Přehraj hudbu')
        .addStringOption(option => option.setName('query').setDescription('Píseň/URL').setRequired(true)),
    new SlashCommandBuilder().setName('skip').setDescription('Přeskoč'),
    new SlashCommandBuilder().setName('stop').setDescription('Zastav'),
    new SlashCommandBuilder().setName('queue').setDescription('Zobraz frontu')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Příkazy nasazeny!'))
    .catch(console.error);
