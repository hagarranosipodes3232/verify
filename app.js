require("dotenv").config();
const express = require("express");
const web = express();

// PAGINA PRINCIPAL

web.get("/", (req, res) => {

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>MVS Verify</title>

  <style>
    body {
      margin: 0;
      background: #101114;
      color: white;
      font-family: Arial, sans-serif;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card {
      width: 500px;
      background: #24262b;
      border-radius: 18px;
      text-align: center;
      padding: 35px;
      box-shadow: 0 0 45px rgba(0,0,0,.55);
      border-top: 4px solid #66865c;
    }

    h1 span {
      color: #6f9365;
    }

    .btn {
      display: block;
      margin-top: 28px;
      padding: 16px;
      border-radius: 10px;
      background: #6f9365;
      color: white;
      text-decoration: none;
      font-weight: bold;
    }
  </style>

</head>

<body>

<div class="card">

<h1>Vincula tu cuenta de <span>Roblox</span></h1>

<p>
Estás a punto de vincular tu cuenta Roblox.
</p>

<a class="btn" href="/roblox">
Sigue con Roblox
</a>

</div>

</body>
</html>
  `);

});

// ROBLOX OAUTH

web.get("/roblox", (req, res) => {

  const discordId = req.query.discord_id;

  if (!discordId) {
    return res.send("❌ No se recibió el ID de Discord.");
  }

  const params = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID,
    redirect_uri: process.env.ROBLOX_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile",
    state: discordId
  });

  res.redirect(
    "https://apis.roblox.com/oauth/v1/authorize?" +
    params.toString()
  );

});

// CALLBACK

web.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const discordId = req.query.state;

    if (!code) return res.send("❌ No se recibió código de Roblox.");
    if (!discordId) return res.send("❌ No se recibió el ID de Discord.");

    const ipRaw =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "Desconocida";

    const ipMasked = ipRaw.replace(/(\d+\.\d+)\.\d+\.\d+/, "$1.***.***");

    const geoResponse = await fetch(`http://ip-api.com/json/${ipRaw}?fields=status,country,regionName,city,isp,proxy,hosting,mobile,query`);
    const geo = await geoResponse.json();

    const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.ROBLOX_CLIENT_ID,
        client_secret: process.env.ROBLOX_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.ROBLOX_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.log(tokenData);
      return res.send("❌ Error al obtener token de Roblox.");
    }

    const userResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const robloxUser = await userResponse.json();

    const robloxId = robloxUser.sub;
    const username = robloxUser.preferred_username || robloxUser.name || "Desconocido";
    const displayName = robloxUser.nickname || "No disponible";

    const details = await fetch(`https://users.roblox.com/v1/users/${robloxId}`).then(r => r.json());

    const createdDate = new Date(details.created);
    const daysOld = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
    const yearsOld = Math.floor(daysOld / 365);

    const estadoCuenta = daysOld < 30
      ? "⚠️ Posible alt / cuenta nueva"
      : "✅ Cuenta segura";

    const avatarData = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`
    ).then(r => r.json());

    const avatarUrl = avatarData.data?.[0]?.imageUrl || null;

    const friends = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/friends/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const followers = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followers/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const following = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followings/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const groupsData = await fetch(`https://groups.roblox.com/v1/users/${robloxId}/groups/roles`)
      .then(r => r.json()).catch(() => ({ data: [] }));

    const groupsCount = groupsData.data?.length || 0;

    const badgesData = await fetch(`https://badges.roblox.com/v1/users/${robloxId}/badges?limit=100&sortOrder=Desc`)
      .then(r => r.json()).catch(() => ({ data: [] }));

    const badgesCount = badgesData.data?.length || 0;
    const badgesText = badgesData.nextPageCursor ? `${badgesCount}+` : `${badgesCount}`;

    const premiumData = await fetch(`https://premiumfeatures.roblox.com/v1/users/${robloxId}/validate-membership`)
      .then(r => r.json()).catch(() => false);

    const premiumText = premiumData === true ? "✅ Sí" : "❌ No / no visible";

    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordId);

    await member.roles.add(VERIFY_ROLE_ID);

    const logChannel = await client.channels.fetch(VERIFY_LOGS_ID);

    const embed = new EmbedBuilder()
      .setTitle("✅ Usuario Verificado | Roblox Premium Check")
      .setColor("#6f9365")
      .setThumbnail(avatarUrl)
      .setDescription(
        "━━━━━━━━━━━━━━━━━━\n\n" +

        `👤 **Discord:** ${member.user}\n` +
        `🆔 **Discord ID:** \`${discordId}\`\n\n` +

        `🎮 **Username Roblox:** \`${username}\`\n` +
        `🪪 **Display Name:** \`${details.displayName || displayName}\`\n` +
        `🆔 **Roblox ID:** \`${robloxId}\`\n` +
        `🔗 **Perfil:** https://www.roblox.com/users/${robloxId}/profile\n\n` +

        `📅 **Cuenta creada:**\n<t:${Math.floor(createdDate.getTime() / 1000)}:F>\n\n` +
        `⏳ **Antigüedad:** ${daysOld} días ${yearsOld > 0 ? `(${yearsOld} año/s)` : ""}\n` +
        `🛡️ **Estado:** ${estadoCuenta}\n` +
        `💎 **Premium:** ${premiumText}\n\n` +

        `👥 **Amigos visibles:** \`${friends.count}\`\n` +
        `👤 **Seguidores:** \`${followers.count}\`\n` +
        `➡️ **Siguiendo:** \`${following.count}\`\n` +
        `👨‍👩‍👧 **Grupos visibles:** \`${groupsCount}\`\n` +
        `🏆 **Badges públicos:** \`${badgesText}\`\n` +
        `🔨 **Bans detectados:** \`No disponible oficialmente\`\n\n` +

        `🌎 **País:** \`${geo.country || "Desconocido"}\`\n` +
        `🏙️ **Ciudad aprox.:** \`${geo.city || "Desconocida"}\`\n` +
        `📍 **Región:** \`${geo.regionName || "Desconocida"}\`\n` +
        `📡 **ISP:** \`${geo.isp || "Desconocido"}\`\n` +
        `🛡️ **VPN/Proxy:** \`${geo.proxy ? "⚠️ Posible VPN/Proxy" : "✅ No detectado"}\`\n` +
        `📱 **Conexión móvil:** \`${geo.mobile ? "Sí" : "No / no detectado"}\`\n` +
        `🌐 **IP:** \`${ipMasked}\`\n\n` +

        "━━━━━━━━━━━━━━━━━━"
      )
      .setFooter({ text: "Sistema premium de verificación Roblox" })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });

    res.send("✅ Verificación completada. Ya recibiste tu rol en Discord.");

  } catch (error) {
    console.log(error);
    res.send("❌ Ocurrió un error al completar la verificación.");
  }
});

// WEB ONLINE

web.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web online");
});
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const discordTranscripts = require("discord-html-transcripts");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDS

const APP_ID = "1502542491742900285";
const GUILD_ID = "1502542235491635282";

const VERIFY_ROLE_ID = "1502547113739944078";
const VERIFY_LOGS_ID = "1502547730600427570";

const STAFF_ROLE_ID = "1502573600840880179";
const TICKET_CATEGORY_ID = "1502573361472077855";
const TICKET_LOGS_ID = "1502573180278149140";

// COMANDOS

const commands = [

  new SlashCommandBuilder()
    .setName("verifypanel")
    .setDescription("Panel de verificación"),

  new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Panel de tickets")

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

  try {

    console.log("⏳ Cargando comandos...");

    await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos cargados.");

  } catch (err) {

    console.log(err);

  }

})();

// BOT ONLINE

client.once("clientReady", () => {

  console.log(`🟢 ${client.user.tag}`);

});

// INTERACCIONES

client.on("interactionCreate", async interaction => {

  // =====================================================
  // SLASH COMMANDS
  // =====================================================

  if (interaction.isChatInputCommand()) {

    // VERIFY PANEL

    if (interaction.commandName === "verifypanel") {

      const embed = new EmbedBuilder()

        .setAuthor({
          name: "Roblox Verification",
          iconURL: "https://cdn-icons-png.flaticon.com/512/5968/5968389.png"
        })

        .setTitle("🔐 Verify Here")

        .setDescription(
          "Bienvenido al sistema oficial de verificación.\n\n" +

          "🎮 Vinculá tu cuenta de Roblox para acceder completamente al servidor.\n\n" +

          "✅ Verificación rápida\n" +
          "🛡️ Protección anti cuentas falsas\n" +
          "⚡ Sistema automático\n\n" +

          "Presioná el botón de abajo para verificarte."
        )

        .setColor("#5b09e4");

      const botones = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("🔐 Verify Roblox")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("info")
            .setLabel("ℹ️ Info")
            .setStyle(ButtonStyle.Secondary)

        );

      return interaction.reply({
        embeds: [embed],
        components: [botones]
      });

    }

    // TICKET PANEL

    if (interaction.commandName === "ticketpanel") {

      const embed = new EmbedBuilder()

        .setTitle("🎫 Sistema de Tickets")

        .setDescription(
          "Bienvenido al sistema oficial de tickets.\n\n" +

          "📩 ¿Necesitás ayuda o soporte?\n" +
          "Nuestro equipo está listo para ayudarte.\n\n" +

          "✅ Soporte rápido\n" +
          "🛡️ Atención privada\n" +
          "📨 Contacto con staff\n\n" +

          "Presioná el botón de abajo para crear un ticket."
        )

        .setColor("#5b09e4");

      const botones = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId("crear_ticket")
            .setLabel("🎫 Crear Ticket")
            .setStyle(ButtonStyle.Primary)

        );

      return interaction.reply({
        embeds: [embed],
        components: [botones]
      });

    }

  }

  // =====================================================
  // BOTONES
  // =====================================================

  if (interaction.isButton()) {

    // VERIFY BUTTON
if (interaction.customId === "verify") {

  const embed = new EmbedBuilder()
    .setTitle("Link your Roblox account")
    .setDescription(
      "Open the verification dashboard to sign in with Roblox and link your Roblox account.\n\n" +
      "The whole flow takes about 30 seconds."
    )
    .setColor("#ff0000");

  const boton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel("Open Verify Dashboard")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://verify-z2au.onrender.com/roblox?discord_id=${interaction.user.id}`)

    );

  return interaction.reply({
    embeds: [embed],
    components: [boton],
    ephemeral: true
  });

}
    // INFO BUTTON

    if (interaction.customId === "info") {

      return interaction.reply({
        content: "ℹ️ Sistema automático de verificación Roblox.",
        ephemeral: true
      });

    }

    // CREAR TICKET

    if (interaction.customId === "crear_ticket") {

      const ticketExistente = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.id}`
      );

      if (ticketExistente) {

        return interaction.reply({
          content: `❌ Ya tenés un ticket abierto: ${ticketExistente}`,
          ephemeral: true
        });

      }

      const canal = await interaction.guild.channels.create({

        name: `ticket-${interaction.user.id}`,

        type: ChannelType.GuildText,

        parent: TICKET_CATEGORY_ID,

        permissionOverwrites: [

          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },

          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },

          {
            id: STAFF_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }

        ]

      });

      const ticketButtons = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId("claim_ticket")
            .setLabel("📌 Reclamar")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("cerrar_ticket")
            .setLabel("🔒 Cerrar")
            .setStyle(ButtonStyle.Danger)

        );

      // DATOS USUARIO

      const fechaCreacionCuenta = `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:F>`;
      const fechaIngresoServidor = `<t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:F>`;

      const diasCuenta = Math.floor(
        (Date.now() - interaction.user.createdTimestamp) / (1000 * 60 * 60 * 24)
      );

      const sospechosa = diasCuenta < 30 ? "⚠️ Posible alt" : "✅ Normal";

      const embedTicket = new EmbedBuilder()

        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL()
        })

        .setTitle("🎫 Ticket Creado")

        .setDescription(
          `Bienvenido ${interaction.user}.\n\n` +

          `📩 Explicá detalladamente tu problema o consulta.\n\n` +

          `━━━━━━━━━━━━━━━━━━\n\n` +

          `👤 Usuario: ${interaction.user}\n` +
          `🆔 ID: ${interaction.user.id}\n\n` +

          `📅 Cuenta creada:\n${fechaCreacionCuenta}\n\n` +

          `🚪 Entró al servidor:\n${fechaIngresoServidor}\n\n` +

          `🛡️ Estado de cuenta:\n${sospechosa}\n\n` +

          `━━━━━━━━━━━━━━━━━━`
        )

        .setThumbnail(interaction.user.displayAvatarURL())

        .setColor("#5b09e4")

        .setFooter({
          text: "Sistema premium de tickets"
        })

        .setTimestamp();

      await canal.send({
        content: `${interaction.user} <@&${STAFF_ROLE_ID}>`,
        embeds: [embedTicket],
        components: [ticketButtons]
      });

      return interaction.reply({
        content: `✅ Ticket creado correctamente: ${canal}`,
        ephemeral: true
      });

    }

    // CLAIM TICKET

    if (interaction.customId === "claim_ticket") {

      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

        return interaction.reply({
          content: "❌ No sos staff.",
          ephemeral: true
        });

      }

      const canal = interaction.channel;

      await canal.permissionOverwrites.edit(STAFF_ROLE_ID, {
        SendMessages: false
      });

      await canal.permissionOverwrites.edit(interaction.user.id, {
        SendMessages: true,
        ViewChannel: true
      });

      await canal.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📌 Ticket Reclamado")
            .setDescription(`El ticket fue reclamado por ${interaction.user}.`)
            .setColor("Blue")
        ]
      });

      return interaction.reply({
        content: "✅ Ticket reclamado correctamente.",
        ephemeral: true
      });

    }

    // CERRAR TICKET

    if (interaction.customId === "cerrar_ticket") {

      const modal = new ModalBuilder()
        .setCustomId("cerrar_modal")
        .setTitle("Cerrar Ticket");

      const razon = new TextInputBuilder()
        .setCustomId("razon")
        .setLabel("Razón del cierre")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(razon);

      modal.addComponents(row);

      return interaction.showModal(modal);

    }

  }

  // =====================================================
  // MODAL CERRAR TICKET
  // =====================================================

  if (interaction.isModalSubmit()) {

    if (interaction.customId === "cerrar_modal") {

      const razon = interaction.fields.getTextInputValue("razon");

      const transcript = await discordTranscripts.createTranscript(interaction.channel);

      const canalLogs = interaction.guild.channels.cache.get(TICKET_LOGS_ID);

      if (canalLogs) {

        const embed = new EmbedBuilder()

          .setTitle("🔒 Ticket Cerrado")

          .setDescription(
            `👤 Cerrado por: ${interaction.user}\n\n` +
            `📝 Razón:\n${razon}`
          )

          .setColor("Red")
          .setTimestamp();

        canalLogs.send({
          embeds: [embed],
          files: [transcript]
        });

      }

      await interaction.reply({
        content: "🔒 Ticket cerrado correctamente.",
        ephemeral: true
      });

      setTimeout(() => {
        interaction.channel.delete();
      }, 3000);

    }

  }

});

// LOGIN
// =========================
// BIENVENIDAS
// =========================

client.on("guildMemberAdd", async member => {

  const canal = member.guild.channels.cache.get("1502542235944747018");

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setAuthor({
      name: member.user.username + " se unió al servidor",
      iconURL: member.user.displayAvatarURL()
    })

    .setTitle("🎉 ¡Bienvenido al servidor!")

    .setDescription(

      "👋 Bienvenido " + member.toString() + ".\n\n" +

      "Esperamos que disfrutes tu estadía en el servidor.\n\n" +

      "📌 No olvides verificarte para acceder a todos los canales.\n\n" +

      "━━━━━━━━━━━━━━━━━━\n\n" +

      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id + "\n" +
      "📅 Cuenta creada:\n<t:" + Math.floor(member.user.createdTimestamp / 1000) + ":F>\n\n" +

      "━━━━━━━━━━━━━━━━━━"

    )

    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

    .setColor("#5b09e4")

    .setFooter({
      text: "Ahora somos " + member.guild.memberCount + " miembros"
    })

    .setTimestamp();

  canal.send({
    content: member.toString(),
    embeds: [embed]
  });

});
// =========================
// LOGS SISTEMA COMPLETO
// =========================

const LOGS_CHANNEL_ID = "1502583622891208947";
const BAN_LOGS_ID = "1502583332699897856";
const TIMEOUT_LOGS_ID = "1502583462169673800";

// =========================
// LOG ENTRADA
// =========================

client.on("guildMemberAdd", async member => {

  const canal = member.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("📥 Usuario Entró")

    .setDescription(
      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id
    )

    .setThumbnail(member.user.displayAvatarURL())

    .setColor("Green")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// LOG SALIDA
// =========================

client.on("guildMemberRemove", async member => {

  const canal = member.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("📤 Usuario Salió")

    .setDescription(
      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id
    )

    .setThumbnail(member.user.displayAvatarURL())

    .setColor("Red")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// MENSAJE ELIMINADO
// =========================

client.on("messageDelete", async message => {

  if (!message.guild) return;
  if (message.author?.bot) return;

  const canal = message.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("🗑️ Mensaje Eliminado")

    .setDescription(
      "👤 Usuario: " + message.author.toString() + "\n" +
      "📍 Canal: " + message.channel.toString() + "\n\n" +
      "💬 Mensaje:\n" + (message.content || "Sin texto")
    )

    .setColor("Orange")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// MENSAJE EDITADO
// =========================

client.on("messageUpdate", async (oldMessage, newMessage) => {

  if (!oldMessage.guild) return;
  if (oldMessage.author?.bot) return;

  const canal = oldMessage.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("✏️ Mensaje Editado")

    .setDescription(
      "👤 Usuario: " + oldMessage.author.toString() + "\n" +
      "📍 Canal: " + oldMessage.channel.toString() + "\n\n" +
      "📝 Antes:\n" + (oldMessage.content || "Sin texto") + "\n\n" +
      "✅ Después:\n" + (newMessage.content || "Sin texto")
    )

    .setColor("Yellow")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// TIMEOUT / AISLAMIENTO
// =========================

client.on("guildMemberUpdate", async (oldMember, newMember) => {

  const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
  const newTimeout = newMember.communicationDisabledUntilTimestamp;

  if (oldTimeout === newTimeout) return;

  const canal = newMember.guild.channels.cache.get(TIMEOUT_LOGS_ID);

  if (!canal) return;

  const timeoutActivo = newTimeout && newTimeout > Date.now();

  let tiempoRestante = "Desconocido";

  if (timeoutActivo) {

    const ms = newTimeout - Date.now();

    const minutos = Math.floor(ms / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) tiempoRestante = dias + " día(s)";
    else if (horas > 0) tiempoRestante = horas + " hora(s)";
    else tiempoRestante = minutos + " minuto(s)";

  }

  let moderador = "Desconocido";

  try {

    const fetchedLogs = await newMember.guild.fetchAuditLogs({
      limit: 1,
      type: 24
    });

    const timeoutLog = fetchedLogs.entries.first();

    if (timeoutLog && timeoutLog.executor) {
      moderador = timeoutLog.executor.toString();
    }

  } catch (error) {

    moderador = "No se pudo obtener";

  }

  const embed = new EmbedBuilder()

    .setTitle(timeoutActivo ? "⏳ Usuario Aislado" : "✅ Aislamiento Removido")

    .setDescription(

      timeoutActivo

      ? "⏳ Un usuario fue aislado temporalmente.\n\n" +

        "👤 Usuario: " + newMember.user.toString() + "\n" +
        "🆔 ID: " + newMember.user.id + "\n\n" +

        "👮 Moderador:\n" + moderador + "\n\n" +

        "⏰ Duración del aislamiento:\n" + tiempoRestante + "\n\n" +

        "📅 Finaliza:\n<t:" + Math.floor(newTimeout / 1000) + ":F>\n\n" +

        "⚠️ Durante este tiempo no podrá hablar ni interactuar normalmente."

      : "✅ El aislamiento del usuario fue removido.\n\n" +

        "👤 Usuario: " + newMember.user.toString() + "\n" +
        "🆔 ID: " + newMember.user.id + "\n\n" +

        "👮 Moderador:\n" + moderador + "\n\n" +

        "📌 El usuario ya puede volver a interactuar normalmente."

    )

    .setThumbnail(newMember.user.displayAvatarURL())

    .setColor(timeoutActivo ? "Orange" : "Green")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// BAN LOGS
// =========================

client.on("guildBanAdd", async ban => {

  const canal = ban.guild.channels.cache.get(BAN_LOGS_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("🔨 Usuario Baneado")

    .setDescription(
      "👤 Usuario: " + ban.user.toString() + "\n" +
      "🆔 ID: " + ban.user.id
    )

    .setThumbnail(ban.user.displayAvatarURL())

    .setColor("DarkRed")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// VOICE LOGS COMPLETOS
// =========================

client.on("voiceStateUpdate", async (oldState, newState) => {

  const canalLogs = newState.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canalLogs) return;

  const usuario = newState.member.user;

  const canalAntes = oldState.channel;
  const canalDespues = newState.channel;

  let titulo = "";
  let color = "Blue";
  let descripcion = "";

  if (!canalAntes && canalDespues) {

    titulo = "🔊 Usuario Entró a Voz";

    color = "Green";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📥 Entró al canal: " + canalDespues.toString();

  }

  else if (canalAntes && !canalDespues) {

    titulo = "🔇 Usuario Salió de Voz";

    color = "Red";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📤 Salió del canal: " + canalAntes.toString();

  }

  else if (canalAntes && canalDespues && canalAntes.id !== canalDespues.id) {

    titulo = "🔁 Usuario Cambió de Canal de Voz";

    color = "Orange";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n\n" +
      "📤 Desde: " + canalAntes.toString() + "\n" +
      "📥 Hacia: " + canalDespues.toString();

  }

  else {

    const cambios = [];

    if (oldState.serverMute !== newState.serverMute) {
      cambios.push(newState.serverMute ? "🔇 Fue silenciado por el servidor" : "🔊 Se le quitó el silencio del servidor");
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
      cambios.push(newState.serverDeaf ? "🔕 Fue ensordecido por el servidor" : "🔔 Se le quitó el ensordecimiento del servidor");
    }

    if (oldState.selfMute !== newState.selfMute) {
      cambios.push(newState.selfMute ? "🎙️ Se muteó" : "🎙️ Se desmuteó");
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
      cambios.push(newState.selfDeaf ? "🎧 Se ensordeció" : "🎧 Dejó de estar ensordecido");
    }

    if (oldState.streaming !== newState.streaming) {
      cambios.push(newState.streaming ? "📺 Empezó a transmitir pantalla" : "📺 Dejó de transmitir pantalla");
    }

    if (oldState.selfVideo !== newState.selfVideo) {
      cambios.push(newState.selfVideo ? "📷 Encendió la cámara" : "📷 Apagó la cámara");
    }

    if (cambios.length === 0) return;

    titulo = "🎙️ Cambio en Voz";

    color = "Blue";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📍 Canal: " + (canalDespues ? canalDespues.toString() : "Desconocido") + "\n\n" +
      cambios.join("\n");

  }

  const embed = new EmbedBuilder()

    .setTitle(titulo)

    .setDescription(descripcion)

    .setThumbnail(usuario.displayAvatarURL())

    .setColor(color)

    .setTimestamp();

  canalLogs.send({
    embeds: [embed]
  });

});
client.login(process.env.TOKEN);
