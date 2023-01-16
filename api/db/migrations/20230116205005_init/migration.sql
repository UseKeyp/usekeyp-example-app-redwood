/*
  Warnings:

  - You are about to drop the column `mintCredits` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OAuthConnectionType" AS ENUM ('TWITCH', 'COINBASE', 'DISCORD', 'CHESS');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mintCredits";

-- CreateTable
CREATE TABLE "OAuthConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OAuthConnectionType" NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "accessToken" TEXT NOT NULL,
    "expiration" TIMESTAMP(3),

    CONSTRAINT "OAuthConnection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OAuthConnection" ADD CONSTRAINT "OAuthConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
