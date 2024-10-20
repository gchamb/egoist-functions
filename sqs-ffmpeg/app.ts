import { SQSEvent, Context } from "aws-lambda";
import { eq, gte, and, lte } from "drizzle-orm";
import { db } from "./db";
import { progressEntry, progressVideo, user } from "./db/schema";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import "dotenv/config";
import { execSync } from "child_process";
import crypto from "crypto";
import { ExpoPushMessage, Expo } from "expo-server-sdk";

const client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY as string,
  },
});

export const lambdaHandler = async (event: SQSEvent, context: Context) => {
  // takes in the message
  let [sqsRecord] = event.Records;

  if (sqsRecord === undefined || sqsRecord === null) {
    return;
  }

  let message:
    | {
        uid: string;
        frequency: "monthly" | "weekly";
        startDate: string;
        endDate: string;
      }
    | undefined;

  if (typeof sqsRecord.body === "string") {
    message = JSON.parse(sqsRecord.body);
  }
  if (typeof sqsRecord.body === "object") {
    message = sqsRecord.body;
  }

  if (message === undefined) {
    return;
  }

  console.log("we have a message", message);

  // reads in progress entry from start date to end date
  const entries = await db
    .select()
    .from(progressEntry)
    .where(
      and(
        eq(progressEntry.userId, message.uid),
        gte(progressEntry.createdAt, message.startDate),
        lte(progressEntry.createdAt, message.endDate)
      )
    );

  if (entries.length === 0) {
    return;
  }

  console.log("entries have been acquired", entries);

  await fs.stat("/tmp/images").catch(async () => await fs.mkdir("/tmp/images"));
  await fs.stat("/tmp/videos").catch(async () => await fs.mkdir("/tmp/videos"));

  console.log("tmp folders have been created");

  // pulls down the s3 images
  await Promise.all(
    entries.map(async (entry, index) => {
      // get image
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME as string,
        Key: entry.blobKey,
      });

      const blobResult = await client.send(command);

      if (!blobResult.Body) {
        return;
      }

      await fs.writeFile(
        `/tmp/images/img${index}.jpg`,
        await blobResult.Body.transformToByteArray()
      );
    })
  );

  console.log("s3 images have been pulled down");

  // from the images generate a video from ffmpeg
  const videoId = crypto.randomUUID();
  const inputPath = "/tmp/images/img%01d.jpg";
  const outputPath = `/tmp/videos/${videoId}.mp4`;

  const command = `ffmpeg -framerate ${
    message.frequency === "weekly" ? "1" : "3"
  } -i ${inputPath} -r 30 -c:v libx264 -pix_fmt yuv420p -s 1080x1090 ${outputPath}`;

  console.log(`ffmpeg command: ${command}`);

  execSync(command);

  if (!(await fs.stat(outputPath))) {
    // do some error handling or dead letter
    throw new Error("ffmpeg output video wasn't created");
  }

  console.log("ffmpeg command ran succesfully");

  // send the generated video to s3
  const blobKey = `progress-video/${videoId}.mp4`;
  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME as string,
    Key: blobKey,
    Body: await fs.readFile(outputPath),
  });

  await client.send(putCommand);

  console.log("video has been uploaded to s3");

  // store the result in progress-video
  await db.insert(progressVideo).values({
    id: crypto.randomUUID(),
    blobKey: blobKey,
    frequency: message.frequency,
    userId: message.uid,
    createdAt: message.endDate,
  });

  console.log("video has been inserted into progress-video ");

  // clear the tmp folder
  await fs.rm("/tmp/images", { recursive: true, force: true });
  await fs.rm("/tmp/videos", { recursive: true, force: true });

  console.log("tmp folders cleaned up");

  // send push notification
  const expoTokens = await db
    .select({ expoToken: user.expoToken })
    .from(user)
    .where(eq(user.id, message.uid));

  console.log("fetching expo token");

  const expo = new Expo();

  const pushMessages: ExpoPushMessage[] = [];

  for (const token of expoTokens) {
    if (token.expoToken) {
      pushMessages.push({
        to: token.expoToken,
        title: "Egoist",
        body: "Your progress video is now ready.",
        data: { url: "/show-all-assets?type=progress-video" },
      });
    }
  }

  const tickets = await expo.sendPushNotificationsAsync(pushMessages);

  console.log(`Successfully created tickets: ${tickets}`);

  return {
    blobKey,
  };
};
