"use client";

import { useCallback, useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

interface ListMember {
  id: string;
  name: string;
  profileImageURL: string | null;
  role: string;
  joinedAt: Date;
}

interface ListItem {
  id: string;
  name: string;
  imageURL: string | null;
  address: string;
  addedAt: Date;
  addedBy: string | null;
}

interface ListData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  visibility: string;
  listColor: string;
  listIcon: string | null;
  items: ListItem[];
  members: ListMember[];
}

function SingularListPane({
  listID,
  listName,
}: {
  listID: string;
  listName: string;
}) {
  const [listData, setListData] = useState<ListData | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchListData = useCallback(async () => {
    setLoading(true);

    if (!listID) {
      return null;
    }
    try {
      const response = await fetch(
        `/api/lists/get_list_data?listID=${listID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error("Failed to fetch list data:", response.statusText);
        return;
      }

      const data = await response.json();
      setListData(data.listData);
      setUserID(data.userID);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching list data:", error);
    }
  }, [listID]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchListData();
    };

    fetchData();
  }, [fetchListData]);

  return (
    <div className="flex flex-col gap-6 mt-4">
      <h1 className="text-2xl font-semibold mb-2">
        {listData ? listData.name : listName}
      </h1>

      {loading ? (
        <div className="flex flex-row items-center gap-2">
          <Spinner />
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <p>list items</p>
      )}
    </div>
  );
}

export default SingularListPane;
