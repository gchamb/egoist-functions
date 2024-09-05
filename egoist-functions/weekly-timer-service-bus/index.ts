import { AzureFunction, Context, Timer } from "@azure/functions";

const weeklyTimer: AzureFunction = async function (
  context: Context,
  timer: Timer
) {
  // get all the current active subscribers
  // send message to queue with data
};

export default weeklyTimer;
