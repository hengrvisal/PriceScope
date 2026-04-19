-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('EBAY_AU', 'FACEBOOK', 'GUMTREE', 'AMAZON_AU');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('EXACT', 'CLOSE', 'RELATED', 'UNRELATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "userPrice" INTEGER,
    "marketplaces" "Marketplace"[],
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "condition" TEXT,
    "sellerName" TEXT,
    "location" TEXT,
    "listingUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "matchType" "MatchType" NOT NULL DEFAULT 'UNRELATED',
    "matchConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rawData" JSONB NOT NULL,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanReport" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "avgPrice" INTEGER NOT NULL,
    "medianPrice" INTEGER NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER NOT NULL,
    "totalListings" INTEGER NOT NULL,
    "platformBreakdown" JSONB NOT NULL,
    "pricePosition" DOUBLE PRECISION,
    "recommendation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Scan_userId_createdAt_idx" ON "Scan"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_scanId_matchConfidence_idx" ON "Listing"("scanId", "matchConfidence");

-- CreateIndex
CREATE UNIQUE INDEX "ScanReport_scanId_key" ON "ScanReport"("scanId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
