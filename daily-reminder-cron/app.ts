import { isNull, sql } from "drizzle-orm";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { db } from "./db";
import { progressEntry, user } from "./db/schema";

export const lambdaHandler = async () => {
  // get all the users who didn't do an progress entry today
  const date = new Date();
  const dateStr = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${
    date.getUTCDate() > 10 ? date.getUTCDate() : `0${date.getUTCDate()}`
  }`;

  const expoTokens = await db
    .select({
      expoToken: user.expoToken,
    })
    .from(user)
    .leftJoin(
      progressEntry,
      sql`${user.id} = ${progressEntry.userId} AND ${progressEntry.createdAt} = ${dateStr}`
    )
    .where(isNull(progressEntry.id));

  const expo = new Expo();

  const pushMessages: ExpoPushMessage[] = [];

  for (const token of expoTokens) {
    if (token.expoToken) {
      pushMessages.push({
        to: token.expoToken,
        title: "Egoist",
        body: "Time for your daily progress picture",
        data: { url: "/entry" },
      });
    }
  }

  const tickets = await expo.sendPushNotificationsAsync(pushMessages);

  console.log(`Successfully created tickets: ${tickets}`);
};
