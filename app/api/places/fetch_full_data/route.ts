import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  lists,
  list_members,
  places,
  list_place_link,
  place_images,
  place_user_link,
  place_tag_link,
  tags,
  countries,
  reviews,
  review_image_link,
  profiles,
} from "@/db/schema";
import { and, inArray, eq } from "drizzle-orm";

interface Photo {
  id: string;
  imageURL: string;
  uploadedAt: Date;
  uploadedBy: string;
  primaryImage: boolean;
  source: "place" | "review";
  reviewID?: string;
}

interface Review {
  id: string;
  username: string | null;
  createdAt: Date;
  stars: number;
  comment: string | null;
  images: Photo[];
}

interface List {
  id: string;
  listName: string;
  listColor: string;
  listIcon: string | null;
}

interface Place {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  country: string;
  state: string | null;
  zipCode: string | null;
  city: string | null;
  mainAddress: string | null;

  favorited: boolean;
  visited: boolean;
  privateNote: string | null;

  tags: string[];
  lists: string[];
  images: Photo[];
  reviews: Review[];
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Signed in user not found" },
      { status: 401 },
    );
  }

  const userID = session?.user.id;
  const url = new URL(req.url);
  const placeID = url.searchParams.get("placeID");

  if (!placeID) {
    return NextResponse.json(
      { error: "Missing required parameter: placeID" },
      { status: 400 },
    );
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [placeDetails] = await tx
        .select({
          id: places.id,
          name: places.placeName,
          description: places.description,
          latitude: places.latitude,
          longitude: places.longitude,
          country: countries.countryName,
          state: places.state,
          zipCode: places.zipCode,
          city: places.city,
          mainAddress: places.mainAddress,
          favorited: place_user_link.favorite,
          visited: place_user_link.visited,
          privateNote: place_user_link.privateNote,
        })
        .from(places)
        .innerJoin(countries, eq(places.countryId, countries.id))
        .leftJoin(
          place_user_link,
          and(
            eq(place_user_link.placeId, places.id),
            eq(place_user_link.userId, userID),
          ),
        )
        .where(eq(places.id, placeID));

      const placeTags = await tx
        .select({
          tagName: tags.tagName,
        })
        .from(place_tag_link)
        .innerJoin(tags, eq(tags.id, place_tag_link.tagId))
        .where(eq(place_tag_link.placeId, placeID));

      const placeImages = await tx
        .select({
          id: place_images.id,
          imageURL: place_images.imageURL,
          uploadedAt: place_images.uploadedAt,
          uploadedBy: profiles.username,
          primaryImage: place_images.primaryImage,
        })
        .from(place_images)
        .innerJoin(profiles, eq(place_images.uploadedBy, profiles.userId))
        .where(
          and(
            eq(place_images.placeId, placeID),
            eq(place_images.underReview, false),
          ),
        );

      const placeReviews = await tx
        .select({
          id: reviews.id,
          username: profiles.username,
          createdAt: reviews.createdAt,
          stars: reviews.stars,
          comment: reviews.comment,
        })
        .from(reviews)
        .innerJoin(profiles, eq(reviews.userId, profiles.userId))
        .where(eq(reviews.placeId, placeID));

      const reviewImages = await tx
        .select({
          id: place_images.id,
          reviewID: reviews.id,
          imageURL: place_images.imageURL,
          uploadedAt: place_images.uploadedAt,
          uploadedBy: profiles.username,
          primaryImage: place_images.primaryImage,
        })
        .from(review_image_link)
        .innerJoin(place_images, eq(review_image_link.imageId, place_images.id))
        .innerJoin(reviews, eq(review_image_link.reviewId, reviews.id))
        .innerJoin(profiles, eq(place_images.uploadedBy, profiles.userId))
        .where(eq(reviews.placeId, placeID));

      const placeInLists = await tx
        .select({
          id: list_place_link.listId,
        })
        .from(list_place_link)
        .innerJoin(
          list_members,
          eq(list_members.listId, list_place_link.listId),
        )
        .where(
          and(
            eq(list_place_link.placeId, placeID),
            eq(list_members.userId, userID),
            inArray(list_members.role, ["Creator", "Admin", "Editor"]),
          ),
        );

      const listDetails = await tx
        .select({
          id: lists.id,
          listName: lists.listName,
          listColor: lists.listColor,
          listIcon: lists.listIcon,
        })
        .from(list_members)
        .innerJoin(lists, eq(list_members.listId, lists.id))
        .where(
          and(
            eq(list_members.userId, userID),
            inArray(list_members.role, ["Creator", "Admin", "Editor"]),
          ),
        );

      const formattedTags = placeTags.map((tag) => tag.tagName);

      const formattedPlaceImages: Photo[] = placeImages.map((image) => ({
        id: image.id,
        imageURL: image.imageURL,
        uploadedAt: image.uploadedAt,
        uploadedBy: image.uploadedBy || "",
        primaryImage: image.primaryImage,
        source: "place",
      }));

      formattedPlaceImages.sort(
        (a, b) => Number(b.primaryImage) - Number(a.primaryImage),
      );

      const reviewImageMap = new Map<string, Photo[]>();

      for (const image of reviewImages) {
        const formattedImage: Photo = {
          id: image.id,
          imageURL: image.imageURL,
          uploadedAt: image.uploadedAt,
          uploadedBy: image.uploadedBy || "",
          primaryImage: image.primaryImage,
          source: "review",
          reviewID: image.reviewID,
        };

        if (!reviewImageMap.has(image.reviewID)) {
          reviewImageMap.set(image.reviewID, []);
        }

        reviewImageMap.get(image.reviewID)?.push(formattedImage);
      }

      const formattedReviews: Review[] = placeReviews.map((review) => ({
        id: review.id,
        username: review.username || null,
        createdAt: review.createdAt,
        stars: review.stars,
        comment: review.comment || null,
        images: reviewImageMap.get(review.id) || [],
      }));

      const formattedListIDs = placeInLists.map((list) => list.id);

      const formattedLists: List[] = listDetails.map((list) => ({
        id: list.id,
        listName: list.listName,
        listColor: list.listColor,
        listIcon: list.listIcon || null,
      }));

      const formattedPlace: Place = {
        id: placeDetails.id,
        name: placeDetails.name,
        description: placeDetails.description || null,
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
        country: placeDetails.country,
        state: placeDetails.state || null,
        zipCode: placeDetails.zipCode || null,
        city: placeDetails.city || null,
        mainAddress: placeDetails.mainAddress || null,

        favorited: placeDetails.favorited || false,
        visited: placeDetails.visited || false,
        privateNote: placeDetails.privateNote || null,

        tags: formattedTags,
        lists: formattedListIDs,
        images: formattedPlaceImages,
        reviews: formattedReviews,
      };

      console.log(formattedPlace);

      return {
        place: formattedPlace,
        lists: formattedLists,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error fetching place data:", error);

    return NextResponse.json(
      { error: "An error occurred while fetching place data" },
      { status: 500 },
    );
  }
}
