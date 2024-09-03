import { app, InvocationContext, Timer } from "@azure/functions";

export async function monthly(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("Timer function processed request.");
  // query all the users that don't have an active revenue cat subscriber row

  // send event to queue with the following data
  // { uid:string, frequency: monthly, month: current_month - 1}
}

app.timer("monthly", {
  // start of every month at 5:00
  schedule: "0 0 5 1 * *",
  handler: monthly,
});
