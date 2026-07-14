import { useState } from "react";

interface Photo {
  id: string;
  placeName: string;
  placePrimaryImageURL: string;
  imageURL: string;
  uploadedBy: string;
  uploadedAt: string;
}

function PhotoReviewSection({ photos }: { photos: Photo[] }) {
  const [photosForReview, setPhotosForReview] = useState<Photo[]>(photos);

  return (
      {photosForReview.length === 0 ? (
        <p className="text-sm text-center">No photos currently awaiting review.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border rounded-lg p-4">
        photosForReview.map((photo) => (
          <div key={photo.id} className="flex flex-colborder rounded-lg">
            <Image
              src={photo.imageURL}
              alt={`Photo of ${photo.placeName} taken by ${photo.uploadedBy}`}
            />

            <div>
              <Image src={photo.placePrimaryImageURL} alt={`Current primary image for ${photo.placeName}`} className="rounded-lg" />
            <h3>{photo.placeName}</h3>
            </div>
            <p title={`Uploaded at: ${photo.uploadedAt}`} className="text-sm text-muted-foreground">
              Uploaded by: {photo.uploadedBy}
            </p>
          </div>
        ))
        </div>
      )}
  );
}

export default PhotoReviewSection;
