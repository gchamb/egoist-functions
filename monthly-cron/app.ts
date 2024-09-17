import { APIGatewayProxyEvent } from "aws-lambda";
import { sql, lt } from "drizzle-orm";
import { db } from "./db";
import { user, revenueCatSubscriber } from "./db/schema";
import {
  SendMessageBatchCommand,
  SQSClient,
  SendMessageBatchRequestEntry,
} from "@aws-sdk/client-sqs";
import "dotenv/config";

const client = new SQSClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY as string,
  },
});
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL as string;

export const lambdaHandler = async (event: APIGatewayProxyEvent) => {
  const date = new Date();

  const users = await db.select({ id: user.id }).from(user);

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

  const entries = users
    .map(({ id }) => {
      return { uid: id, frequency: "monthly", startDate, endDate };
    })
    .map((userMessage): SendMessageBatchRequestEntry => {
      return {
        Id: userMessage.uid,
        MessageBody: JSON.stringify(userMessage),
      };
    });

  if (entries.length === 0) {
    return;
  }

  console.log("converted entries to messages");

  // send to sqs
  const command = new SendMessageBatchCommand({
    QueueUrl: SQS_QUEUE_URL,
    Entries: entries,
  });

  await client.send(command);

  console.log("messages have been sent");
};
