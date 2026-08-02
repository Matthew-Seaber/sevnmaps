import { getImageURL } from "@/lib/images";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Photo {
  id: string;
  imageURL: string;
  uploadedAt: Date;
  uploadedBy: string;
  primaryImage: boolean;
  source: "place" | "review";
  reviewID?: string;
}

function FullScreenImage({
  images,
  initialImageID,
  placeName,
}: {
  images: Photo[];
  initialImageID?: string;
  placeName: string;
}) {
  const selectedImage = initialImageID
    ? images.find((image) => image.id === initialImageID)
    : images[0];

  return (
    <div className="fixed inset-0 z-20 bg-slate-950">
      <div className="absolute inset-0 top-8 mx-8 flex flex-row items-start justify-between gap-4">
        {selectedImage && (
          <div className="flex flex-col gap-2 left-8 py-4 px-6 bg-background opacity-90 rounded-md shadow-lg">
            <h3 className="font-semibold">{placeName}</h3>
            <div className="flex flex-col gap-0.5 pl-2 text-muted-foreground border-l border-border">
              <p className="text-sm ">@{selectedImage.uploadedBy}</p>
              <p className="text-xs">
                {new Date(selectedImage.uploadedAt).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                  },
                )}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="z-30 rounded-full w-12 h-12 shadow-lg opacity-90"
        >
          <X className="w-5! h-5!" />
        </Button>
      </div>

      <Image
        src={getImageURL(selectedImage?.imageURL || "", false)}
        alt={`Image of ${placeName}`}
        fill
        className="object-contain"
      />
    </div>
  );
}

export default FullScreenImage;
