import { Queue } from "bullmq";
import { redis } from "./redis";
import type { Marketplace } from "@prisma/client";

export type ScanJobData = {
  scanId: string;
  query: string;
  category?: string;
  location?: string;
  userPrice?: number;
  marketplaces: Marketplace[];
  userId?: string;
  watchlistId?: string;
};

export const SCAN_QUEUE = "scan-queue";
export const ALERT_QUEUE = "alert-queue";

export const scanQueue = new Queue<ScanJobData>(SCAN_QUEUE, { connection: redis });
export const alertQueue = new Queue(ALERT_QUEUE, { connection: redis });
