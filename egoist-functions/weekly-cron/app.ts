import { gte } from "drizzle-orm";
import { db } from "./db";
import { revenueCatSubscriber } from "./db/schema";
import {
  SendMessageBatchCommand,
  SQSClient,
  SendMessageBatchRequestEntry,
} from "@aws-sdk/client-sqs";

const client = new SQSClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY as string,
  },
});
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL as string;

export const lambdaHandler = async () => {
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
  const activeSubs = activeSubscribers
    .map((sub) => {
      return { uid: sub.id, frequency: "weekly", startDate, endDate };
    })
    .map((userMessage): SendMessageBatchRequestEntry => {
      return {
        Id: userMessage.uid,
        MessageBody: JSON.stringify(userMessage),
      };
    });

  const command = new SendMessageBatchCommand({
    QueueUrl: SQS_QUEUE_URL,
    Entries: activeSubs,
  });

  await client.send(command);
};
