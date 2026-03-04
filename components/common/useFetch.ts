"use client";

import useSWR from "swr";

export default function useFetch<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options?: any
) {
  const swr = useSWR(key, fetcher as any, options as any);
  const { data, error, isLoading, mutate } = swr as {
    data?: T;
    error?: any;
    isLoading?: boolean;
    mutate: () => Promise<any>;
  };

  return { data, error: error?.message ?? null, isLoading: !!isLoading, mutate } as {
    data: T | undefined;
    error: string | null;
    isLoading: boolean;
    mutate: () => Promise<any>;
  };
}
