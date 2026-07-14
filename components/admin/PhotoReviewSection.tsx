"use client";

import { useState } from "react";

import Image from "next/image";

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

  return (
    <>
      {photosForReview.length === 0 ? (
        <p className="text-sm text-center my-8">
          No photos currently awaiting review.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border rounded-lg p-4">
          {photosForReview.map((photo) => (
            <div key={photo.id} className="flex flex-col border rounded-lg">
              <Image
                src={photo.imageURL}
                width={300}
                height={200}
                alt={`Photo of ${photo.placeName} taken by ${photo.uploadedBy}`}
              />

              <div className="flex flex-row items-center gap-2 mt-2">
                {photo.placePrimaryImageURL && (
                  <Image
                    src={photo.placePrimaryImageURL}
                    alt={`Current primary image for ${photo.placeName}`}
                    width={30}
                    height={20}
                    className="rounded-lg"
                  />
                )}
                <h3>{photo.placeName}</h3>
              </div>
              <p
                title={`Uploaded at: ${photo.uploadedAt}`}
                className="text-sm text-muted-foreground"
              >
                Uploaded by: {photo.uploadedBy}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default PhotoReviewSection;
