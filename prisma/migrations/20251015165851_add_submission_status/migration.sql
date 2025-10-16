-- DropIndex
DROP INDEX "public"."Form_userId_key";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
