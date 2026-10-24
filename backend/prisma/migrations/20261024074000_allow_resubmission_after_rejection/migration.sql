-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "repositoryUrlNormalized" DROP NOT NULL;

-- Rejected submissions no longer block resubmitting the same repository.
UPDATE "submissions" SET "repositoryUrlNormalized" = NULL WHERE "status" = 'REJECTED';
