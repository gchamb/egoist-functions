import { AzureFunction, Context, Timer } from "@azure/functions";
import { lt, sql } from "drizzle-orm";
import { db } from "../db";
import { revenueCatSubscriber, user } from "../db/schema";

const monthlyTimer: AzureFunction = async function (
  context: Context,
  timer: Timer
) {
  context.log("Timer function processed request.");
  const date = new Date();
  // all free users
  // expired paid users
  const query = sql`
      SELECT id from ${user}
      EXCEPT
      SELECT user_id as id from ${revenueCatSubscriber}
      `;
  const [result, _] = await db.execute(query);
  if (!Array.isArray(result)) {
    throw new Error(`Except query has failed. ${result}`);
  }
  const expiredSubsData = await db
    .select({ id: revenueCatSubscriber.userId })
    .from(revenueCatSubscriber)
    .where(lt(revenueCatSubscriber.expirationAtMs, Date.now()));
  const unsubscribedUserIds = result.flatMap((val) => val.id);
  const expiredSubscribers = expiredSubsData.flatMap((val) => val.id);
  const allIds = [...unsubscribedUserIds, ...expiredSubscribers];
  const yesterday = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - 1
  );
  const startDate = `${yesterday.getUTCFullYear()}-${
    yesterday.getUTCMonth() + 1
  }-01`;
  const endDate = `${yesterday.getUTCFullYear()}-${
    yesterday.getUTCMonth() + 1
  }-${
    yesterday.getUTCDate() > 10
      ? yesterday.getUTCDate()
      : `0${yesterday.getUTCDate()}`
  }`;

  return allIds.map((id) => {
    return { uid: id, frequency: "monthly", startDate, endDate };
  });
};

export default monthlyTimer;
