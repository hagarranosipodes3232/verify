require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde pong"),

  new SlashCommandBuilder()
    .setName("verificacion")
    .setDescription("Panel de verificación")

].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

  try {

    await rest.put(
      Routes.applicationCommands("1502542491742900285"),
      { body: commands }
    );

    console.log("✅ Comandos cargados.");

  } catch (error) {

    console.error(error);

  }

})();

client.once("clientReady", () => {

  console.log(`🟢 ${client.user.tag}`);

});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {

    await interaction.reply("🏓 Pong!");

  }

  if (interaction.commandName === "verificacion") {

    await interaction.reply("✅ Sistema funcionando.");

  }

});

client.login(process.env.TOKEN);