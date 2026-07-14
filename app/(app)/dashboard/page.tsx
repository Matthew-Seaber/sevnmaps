import { db } from "@/db";
import { place_images, places, user } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";

import { protectAdminPages } from "@/lib/auth-check";

import PhotoReviewSection from "@/components/admin/PhotoReviewSection";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

async function AdminDashboardPage() {
  await protectAdminPages();

  const primaryImages = alias(place_images, "primaryImages");
  const photosForReview = await db
    .select({
      id: place_images.id,
      placeName: places.placeName,
      placePrimaryImageURL: primaryImages.imageURL,
      imageURL: place_images.imageURL,
      uploadedBy: user.name,
      uploadedAt: place_images.uploadedAt,
    })
    .from(place_images)
    .innerJoin(places, eq(places.id, place_images.placeId))
    .innerJoin(user, eq(user.id, place_images.uploadedBy))
    .leftJoin(
      primaryImages,
      and(
        eq(primaryImages.placeId, places.id),
        eq(primaryImages.primaryImage, true),
      ),
    )
    .where(eq(place_images.underReview, true));
  photosForReview.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-8">
        Admin Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Photo Review</CardTitle>
          <CardDescription>
            Reject/approve user-uploaded photos for places and reviews
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
