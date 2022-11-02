import {
  Client,
  GatewayIntentBits,
  messageLink,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  TextChannel,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { prisma } from "./prisma/dbserver.js";
import { NotFoundError } from "@prisma/client/runtime";
// config
const BOT_TOKEN = process.env.BOT_TOKEN || console.error("NO BOT TOKEN");
const POST_CHANNEL =
  process.env.POST_CHANNEL || console.error("NO POST CHANNEL");
const KING_ID = process.env.KING_ID || console.error("NO KING ID");

const row = new ActionRowBuilder.addComponents(
  new ButtonBuilder()
    .setCustomId(`takeBtn`)
    .setLabel("TAKE ORDER")
    .setStyle(ButtonStyle.Primary)
);

const disable_btn = new ActionRowBuilder.addComponents(
  new ButtonBuilder()
    .setCustomId("takeBtn")
    .setLabel("TAKEN")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});
//discord bot login
export const dcLogin = async () => {
  client.once("ready", () => {
    console.log("Bot Online 30/oct update");
    client.setMaxListeners(1);
    dcListenTakeOrder();
  });

  await client.login(BOT_TOKEN || "");
};

dcLogin();

//discord bot logout
export const dcLogout = async () => {
  console.log("logging out");
  client.on("disconnect", () => {
    console.log("logged out");
  });
  await client.destroy();
};

// discord action

export const dcSendOrder = async (orderID, request, price) => {
  // diff id button for diffrent order
  await client.channels.cache.get(`${POST_CHANNEL}`)?.send({
    content: `@everyone NEW ORDER ARRIVED!\n Order ID:[${orderID}]\n Order details:${request}\n Price:RM${price}`,
    components: [row],
  });
};
// listening on button clicked
export const dcListenTakeOrder = async () => {
  console.log("listening to button click");
  client.on("interactionCreate", async (action) => {
    if (action.customId === `takeBtn`) {
      // console.log(action);
      const MsgContent = action.message.content;
      const regExp = /\[([^)]+)\]/;
      const matches = regExp.exec(MsgContent);
      if (!matches) {
        throw Error("Message has invalid id");
      }
      // console.log(matches[1]);
      const orderID = matches[1];
      const dbResult = await prisma.orderlist.findUnique({
        where: {
          order_id: parseInt(orderID),
        },
      });
      // console.log(dbResult);

      // update the button interaction ( cancel the interaction error )
      await action.deferUpdate();
      // set the channel message to taken
      if (dbResult) {
        await action.editReply({
          content: `TOO LATE ORDER TAKEN!\n Order ID:${dbResult.order_id}\n Order details:${dbResult.request}\n Price:${dbResult.price}`,
          components: [disable_btn],
        });

        // send to button clicker order info
        await action.user.send(
          `U TOOK ORDER WITH ID : [${dbResult.order_id}]\n username : ${dbResult.username}\n password : ${dbResult.password}\n Order details : ${dbResult.request}\n Price : RM${dbResult.price}\n DM <@${KING_ID}> picture of BEFORE and AFTER.\n GOOD LUCK AND FA DA CHAI !`
        );

        // notify owner who took the order
        await client.users.cache
          .get(KING_ID || "")
          ?.send(
            `<@${action.user.id}> took order with id : ${dbResult.order_id}`
          );
        // update the order item with player discord id in database
        await prisma.orderlist.update({
          where: {
            order_id: dbResult.order_id,
          },
          data: {
            player_id: action.user.id,
          },
        });
      } else {
        console.error("cant find order with specific id");
      }
      // find the player in player db -> if error = no have the player -> create the player record
      try {
        await prisma.player.findUniqueOrThrow({
          where: {
            discord_id: action.user.id,
          },
        });
      } catch (e) {
        if (e instanceof NotFoundError) {
          console.log("creating new player...");
          await prisma.player.create({
            data: {
              discord_id: action.user.id,
              nickname: action.user.tag,
              balance: 0,
            },
          });
        } else {
          throw e;
        }
      }
    }
  });
};
