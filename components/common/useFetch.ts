"use client";

import useSWR from "swr";

export default function useFetch<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options?: Parameters<typeof useSWR>[2]
) {
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher as any, options);
  return { data, error: error?.message ?? null, isLoading, mutate } as {
    data: T | undefined;
    error: string | null;
    isLoading: boolean;
    mutate: () => Promise<any>;
  };
}
