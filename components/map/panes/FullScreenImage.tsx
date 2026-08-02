"use client";

import { useState } from "react";

import { getImageURL } from "@/lib/images";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TriangleAlert, X } from "lucide-react";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(() => {
    const initialIndex = images.findIndex(
      (image) => image.id === initialImageID,
    );

    return initialIndex !== -1 ? initialIndex : 0;
  });

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="fixed inset-0 z-20 bg-slate-950">
      <div className="absolute inset-0 top-8 mx-8 flex flex-row items-start justify-between gap-4">
        {selectedImage ? (
          <div className="z-30 flex flex-col gap-1 left-8 pt-4 pb-5 px-6 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border">
            <h3 className="font-semibold">{placeName}</h3>
            <p className="text-xs text-muted-foreground">
              @{selectedImage.uploadedBy} ·{" "}
              {new Date(selectedImage.uploadedAt).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                },
              )}
            </p>
          </div>
        ) : (
          <div className="z-30 flex flex-col gap-1 left-8 pt-4 pb-5 px-6 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border">
            <h3 className="font-semibold">{placeName}</h3>
            <p className="text-xs text-muted-foreground">
              Error getting image metadata.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="z-30 rounded-full w-12 h-12 shadow-lg opacity-90"
        >
          <X className="w-5! h-5!" />
        </Button>
      </div>

      <div className="absolute inset-0 top-1/2 mx-8 flex flex-row justify-between gap-4">
        <Button
          variant="outline"
          disabled={selectedImageIndex === 0}
          onClick={() => {
            setSelectedImageIndex((prev) => prev - 1);
          }}
          className="z-30 rounded-full w-12 h-12 shadow-lg opacity-90"
        >
          <ChevronLeft className="w-5! h-5!" />
        </Button>

        <Button
          variant="outline"
          disabled={selectedImageIndex === images.length - 1}
          onClick={() => {
            setSelectedImageIndex((prev) => prev + 1);
          }}
          className="z-30 rounded-full w-12 h-12 shadow-lg opacity-90"
        >
          <ChevronRight className="w-5! h-5!" />
        </Button>
      </div>

      {!selectedImage?.imageURL ? (
        <div className="absolute inset-0 flex flex-row gap-3 items-center justify-center text-slate-100">
          <TriangleAlert className="w-5.5 h-5.5" />
          <p className="font-semibold text-xl">Error loading image.</p>
        </div>
      ) : (
        <Image
          src={getImageURL(selectedImage?.imageURL || "", false)}
          alt={`Image of ${placeName}`}
          fill
          className="object-contain"
        />
      )}

      <p className="absolute bottom-0 z-30 h-fit w-fit bg-foreground/50 text-xs text-secondary/75 p-1.5 rounded-tr-sm">
        Images may be copyrighted. Please report any copyright violations{" "}
        <Link
          href="/contact"
          target="_blank"
          className="font-medium hover:font-semibold text-secondary/80 underline"
        >
          here
        </Link>
        .
      </p>

      <div className="absolute bottom-0 right-0 z-30 h-fit w-fit bg-foreground/50 text-sm text-secondary/75 p-1.5 rounded-tl-sm">
        <Link
          href="/contact"
          target="_blank"
          className="flex flex-row items-center gap-2 font-medium hover:font-semibold text-secondary/80 underline"
        >
          <TriangleAlert className="w-4 h-4" />
          Report image
        </Link>
      </div>
    </div>
  );
}

export default FullScreenImage;
