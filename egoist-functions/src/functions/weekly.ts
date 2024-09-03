import { app, InvocationContext, Timer } from "@azure/functions";

export async function weekly(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("Timer function processed request.");
  // query all the users that have an active revenue cat subscriber row

  // send event to queue with the following data
  // { uid:string, frequency: weekly, startDate: last sunday, endDate:this sunday}
}

app.timer("weekly", {
  // every sunday at 5:00
  schedule: "0 0 5 * * 0",
  handler: weekly,
});
