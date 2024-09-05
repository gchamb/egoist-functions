import { relations } from "drizzle-orm/relations";
import {
  user,
  progressEntry,
  progressReport,
  progressVideo,
  revenueCatSubscriber,
} from "./schema";

export const progressEntryRelations = relations(progressEntry, ({ one }) => ({
  user: one(user, {
    fields: [progressEntry.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  progressEntries: many(progressEntry),
  progressReports: many(progressReport),
  progressVideos: many(progressVideo),
  revenueCatSubscribers: one(revenueCatSubscriber),
}));

export const progressReportRelations = relations(progressReport, ({ one }) => ({
  user: one(user, {
    fields: [progressReport.userId],
    references: [user.id],
  }),
}));

export const progressVideoRelations = relations(progressVideo, ({ one }) => ({
  user: one(user, {
    fields: [progressVideo.userId],
    references: [user.id],
  }),
}));

export const revenueCatSubscriberRelations = relations(
  revenueCatSubscriber,
  ({ one }) => ({
    user: one(user, {
      fields: [revenueCatSubscriber.userId],
      references: [user.id],
    }),
  })
);
