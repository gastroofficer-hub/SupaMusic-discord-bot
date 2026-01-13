Discord Music Bot:
Jednoduchý Discord music bot s slash příkazy pro přehrávání hudby z YouTube a Spotify.

Funkce
🎵 /play <URL/název> - Přehraj píseň nebo vyhledávej

📱 /playlist <URL> - Přidej celý YT/Spotify playlist
🔊 /volume <0-100> - Nastav hlasitost
⏭️ /skip - Přeskoč aktuální píseň
⏹️ /stop - Zastav a vymaž frontu
📋 /queue - Zobraz frontu skladeb

Instalace:
bash
npm init -y
npm install discord.js discord-player @discord-player/extractor dotenv
Konfigurace
Vytvoř .env soubor:

text
TOKEN=twůj_bot_token
Restartuj bota - slash příkazy se automaticky zaregistrují

Spuštění:
bash
node index.js
Příklady použití
text
/play https://youtube.com/watch?v=dQw4w9WgXcQ
/playlist https://youtube.com/playlist?list=PL...
/volume 70
/queue
Požadavky
Node.js 18+

Discord Bot Token (s bot a applications.commands oprávněními)

Voice Channel přístup

Bot se automaticky odpojí po skončení fronty. Podporuje YouTube, Spotify playlisty a vyhledávání! 🎶
