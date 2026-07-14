import { db } from "@/db";
import { place_images, places, user } from "@/db/schema";
import { eq } from "drizzle-orm";

import { protectAdminPages } from "@/lib/auth-check";

import PhotoReviewSection from "@/components/admin/PhotoReviewSection";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Photo {
  id: string;
  placeName: string;
  placePrimaryImageURL: string;
  imageURL: string;
  uploadedBy: string;
  uploadedAt: string;
}

async function AdminDashboardPage() {
  await protectAdminPages();

  const photosForReview = await db.select().from(place_images).where(eq(place_images.underReview, true));
  photosForReview.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return(
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        Admin Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Photo Review</CardTitle>
          <CardDescription>
            Review and approve/remove user-uploaded photos for places and
            reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoReviewSection photos={photosForReview} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboardPage;
