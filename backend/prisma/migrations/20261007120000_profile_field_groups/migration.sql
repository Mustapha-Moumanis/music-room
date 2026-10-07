-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "friendsInfo",
DROP COLUMN "musicPreferences",
DROP COLUMN "privateInfo",
DROP COLUMN "publicInfo",
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "musicGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "musicTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "musicVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "realName" TEXT;

