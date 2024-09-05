import { AzureFunction, Context, Timer } from "@azure/functions";
import { db } from "../db";
import { revenueCatSubscriber } from "../db/schema";
import { gte } from "drizzle-orm";

const weeklyTimer: AzureFunction = async function (
  context: Context,
  timer: Timer
) {
  const todaysDate = new Date();
  const lastsWeekDate = new Date();
  lastsWeekDate.setUTCDate(lastsWeekDate.getUTCDate() - 7);

  // get all the current active subscribers
  const activeSubscribers = await db
    .select({
      id: revenueCatSubscriber.id,
    })
    .from(revenueCatSubscriber)
    .where(gte(revenueCatSubscriber.expirationAtMs, Date.now()));

  const startDate = `${lastsWeekDate.getUTCFullYear()}-${
    lastsWeekDate.getUTCMonth() + 1
  }-${
    lastsWeekDate.getUTCDate() > 10
      ? lastsWeekDate.getUTCDate()
      : `0${lastsWeekDate.getUTCDate()}`
  }`;
  const endDate = `${todaysDate.getUTCFullYear()}-${
    todaysDate.getUTCMonth() + 1
  }-${
    todaysDate.getUTCDate() > 10
      ? todaysDate.getUTCDate()
      : `0${todaysDate.getUTCDate()}`
  }`;

  // send message to queue with data
  return activeSubscribers.map((sub) => {
    return { uid: sub.id, frequency: "weekly", startDate, endDate };
  });
};

export default weeklyTimer;
