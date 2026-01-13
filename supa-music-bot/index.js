require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client);
player.extractors.loadMulti(DefaultExtractors).catch(console.error);

client.on('ready', async () => {
    console.log(`${client.user.tag} online!`);
    
    // Registrace slash příkazů (nahraď YOUR_GUILD_ID svým guild ID pro testování)
    const commands = [
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('Přehraj píseň nebo track')
            .addStringOption(option =>
                option.setName('query')
                    .setDescription('URL nebo název písně')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('playlist')
            .setDescription('Přidej YT/Spotify playlist')
            .addStringOption(option =>
                option.setName('query')
                    .setDescription('Playlist URL')
                    .setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('volume')
            .setDescription('Nastav hlasitost (0-100%)')
            .addIntegerOption(option =>
                option.setName('volume')
                    .setDescription('Hlasitost v %')
                    .setRequired(true)
                    .setMinValue(0)
                    .setMaxValue(100)
            ),
        new SlashCommandBuilder()
            .setName('skip')
            .setDescription('Přeskoč aktuální píseň'),
        new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Zastav přehrávání a vymaž frontu'),
        new SlashCommandBuilder()
            .setName('queue')
            .setDescription('Zobraz frontu (prvních 10 skladeb)')
    ].map(command => command.toJSON());

    // Pro globální příkazy použij client.application.commands.set(commands)
    // Pro testování na jednom serveru: await client.guilds.cache.get('YOUR_GUILD_ID')?.commands.set(commands);
    await client.application.commands.set(commands);
    console.log('Slash příkazy zaregistrovány!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'play' || commandName === 'playlist') {
        try {
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply('❌ **Připoj se do voice kanálu!**');
            
            await interaction.deferReply();
            const query = interaction.options.getString('query', true);
            console.log('Hledám:', query);
            
            const searchResult = await player.search(query, { requestedBy: interaction.user });
            console.log('Nalezeno tracků:', searchResult.tracks.length);
            
            if (!searchResult?.tracks.length) {
                return interaction.editReply('❌ **Žádná píseň nebo playlist nenalezen!**');
            }
            
            const queue = await player.play(voiceChannel, searchResult, {
                nodeOptions: { 
                    metadata: interaction.channel,
                    leaveOnEnd: true,
                    leaveOnEmpty: true,
                    volume: 70 // Výchozí hlasitost 70%
                }
            });
            
            if (searchResult.playlist) {
                const embed = new EmbedBuilder()
                    .setDescription(`**${searchResult.playlist.title}** ▶️\n**(${searchResult.tracks.length} skladeb přidáno!)**`)
                    .setThumbnail(searchResult.tracks[0]?.thumbnail)
                    .setColor('#00ff00');
                interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setDescription(`**${searchResult.tracks[0].title}** ▶️ **přidáno!**`)
                    .setThumbnail(searchResult.tracks[0].thumbnail)
                    .setColor('#00ff00');
                interaction.editReply({ embeds: [embed] });
            }
            console.log('Přidáno do fronty!');
        } catch (error) {
            console.error('Play/Playlist error:', error);
            interaction.editReply('❌ **Chyba při přehrávání:** ' + error.message).catch(() => {});
        }
    } else if (commandName === 'volume') {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue) return interaction.reply('❌ **Nic nehraje!**');
        
        const volume = interaction.options.getInteger('volume', true);
        if (volume < 0 || volume > 100) return interaction.reply('❌ **Hlasitost musí být 0-100%!**');
        
        queue.node.setVolume(volume);
        interaction.reply(`🔊 **Hlasitost nastavena na ${volume}%**`);
    } else if (commandName === 'skip') {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue) return interaction.reply('❌ **Nic nehraje!**');
        if (!queue.currentTrack) return interaction.reply('❌ **Žádná píseň nehraje!**');
        
        queue.node.skip();
        interaction.reply('⏭️ **Píseň přeskočena!**');
    } else if (commandName === 'stop') {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue) return interaction.reply('❌ **Nic nehraje!**');
        
        queue.delete();
        interaction.reply('⏹️ **Přehrávání zastaveno a fronta vymazána!**');
    } else if (commandName === 'queue') {
        const queue = player.nodes.get(interaction.guildId);
        if (!queue?.currentTrack) return interaction.reply('❌ **Fronta je prázdná!**');
        
        const tracks = queue.tracks.toArray().slice(0, 10).map((t, i) => `**${i+1}.** ${t.title}`);
        const current = `**🎵 Teď hraje:** ${queue.currentTrack.title}`;
        
        interaction.reply(`**📋 Fronta (${queue.tracks.size} skladeb):**\n${current}\n\n${tracks.join('\n')}${queue.tracks.size > 10 ? '\n\n**a dalších...**' : ''}`);
    }
});

player.events.on('playerStart', (queue, track) => {
    console.log('Začíná hrát:', track.title);
    queue.metadata?.send({
        embeds: [new EmbedBuilder()
            .setDescription(`**🎵 ${track.title}** ▶️`)
            .setThumbnail(track.thumbnail)
            .setColor('#00ff00')
        ]
    });
});

player.events.on('error', (error) => console.error('Player error:', error));

client.on('messageCreate', message => {
    if (message.content === '!play test') {
        console.log('Message funguje!');
        message.reply('Debug OK!');
    }
});

client.login(process.env.TOKEN);
