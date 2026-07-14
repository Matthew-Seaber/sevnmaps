"use client";

import { useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface Photo {
  id: string;
  placeName: string;
  placePrimaryImageURL: string | null;
  imageURL: string;
  uploadedBy: string | null;
  uploadedAt: Date;
}

function PhotoReviewSection({ photos }: { photos: Photo[] }) {
  const [photosForReview, setPhotosForReview] = useState<Photo[]>(photos);
  const [makePrimaryImage, setMakePrimaryImage] = useState<
    Record<string, boolean>
  >({});

  async function handleApprove(photoID: string, makePrimary: boolean) {
    const response = await fetch("/api/admin/approve_photo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photoID, makePrimary }),
    });

    if (response.ok) {
      setPhotosForReview((prevPhotos) =>
        prevPhotos.filter((photo) => photo.id !== photoID),
      );
    } else {
      toast.error(
        `Failed to approve photo for ${photosForReview.find((p) => p.id === photoID)?.placeName}. Please try again later.`,
      );
    }
  }

  async function handleReject(photoID: string) {
    const response = await fetch("/api/admin/remove_photo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photoID }),
    });

    if (response.ok) {
      setPhotosForReview((prevPhotos) =>
        prevPhotos.filter((photo) => photo.id !== photoID),
      );
    } else {
      toast.error(
        `Failed to reject photo for ${photosForReview.find((p) => p.id === photoID)?.placeName}. Please try again later.`,
      );
    }
  }

  return (
    <>
      {photosForReview.length === 0 ? (
        <p className="text-sm text-center my-8">
          No photos currently awaiting review.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:border rounded-lg p-4">
          {photosForReview.map((photo) => (
            <div key={photo.id} className="flex flex-col border rounded-lg">
              <Image
                src={photo.imageURL}
                width={400}
                height={250}
                alt={`Photo of ${photo.placeName} taken by ${photo.uploadedBy}`}
                className="object-cover rounded-t-lg w-full h-auto"
              />

              <div className="flex flex-row items-center gap-3 mt-3 mb-1 px-4">
                {photo.placePrimaryImageURL && (
                  <Image
                    src={photo.placePrimaryImageURL}
                    alt={`Current primary image for ${photo.placeName}`}
                    width={80}
                    height={50}
                    className="rounded-sm w-auto h-auto"
                  />
                )}
                <h3 className="text-base font-semibold">{photo.placeName}</h3>
              </div>
              <p
                title={`Uploaded ${photo.uploadedAt}`}
                className="text-xs text-muted-foreground px-4"
              >
                Uploaded by: {photo.uploadedBy}
              </p>

              {!photo.placePrimaryImageURL && (
                <div className="flex flex-row items-center mt-3 gap-2 px-4">
                  <Checkbox
                    checked={makePrimaryImage[photo.id] ?? false}
                    onCheckedChange={(checked) =>
                      setMakePrimaryImage((prev) => ({
                        ...prev,
                        [photo.id]: checked === true,
                      }))
                    }
                  />
                  <Label>Make primary image</Label>
                </div>
              )}

              <div className="flex flex-row gap-1 my-3 px-4 w-full">
                <Button
                  variant="destructive"
                  className="flex-1 p-5"
                  onClick={() => handleReject(photo.id)}
                >
                  Reject
                </Button>
                <Button
                  className="flex-1 p-5"
                  onClick={() =>
                    handleApprove(photo.id, makePrimaryImage[photo.id] ?? false)
                  }
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toaster position="top-center" />
    </>
  );
}

export default PhotoReviewSection;
