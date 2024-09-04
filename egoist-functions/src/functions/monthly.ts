import { app, InvocationContext, Timer, output } from "@azure/functions";
import { lt, sql } from "drizzle-orm";
import { db } from "../db";
import { revenueCatSubscriber, user } from "../db/schema";

export async function monthly(myTimer: Timer, context: InvocationContext) {
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
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1
  );

  const startDate = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-01`;
  const endDate = `${yesterday.getFullYear()}-${
    yesterday.getMonth() + 1
  }-${yesterday.getDate()}`;

  return allIds.map((id) => {
    return { uid: id, frequency: "monthly", startDate, endDate };
  });
}

app.timer("monthly", {
  // start of every month at 5:00
  schedule: "0 0 5 1 * *",
  handler: monthly,
  return: output.serviceBusQueue({
    queueName: "egoist",
    connection: process.env.AZURE_EGOIST_VIDEO_QUEUE_STRING,
  }),
});
