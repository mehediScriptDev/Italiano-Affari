"use client";

import useSWR from "swr";
import { fetchContents } from "@/lib/api/partners";

type ContentItem = any;

async function fetchAllPages(): Promise<ContentItem[]> {
  let all: ContentItem[] = [];
  let pg = 1;
  while (true) {
    const r = await fetchContents({ page: pg });
    all = all.concat(r.data);
    if (!r.last_page || pg >= r.last_page) break;
    pg++;
  }
  return all;
}

export default function useContents() {
  const { data, error, isLoading, mutate } = useSWR("contents", fetchAllPages, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60_000,
  });

  return { data: data ?? [], error: error?.message ?? null, isLoading, reload: mutate };
}
