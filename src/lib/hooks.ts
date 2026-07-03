import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/db";
import { toast } from "sonner";

export function useList<K extends keyof typeof api>(key: K) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const fn = (api[key] as { list?: () => Promise<unknown>; get?: () => Promise<unknown> });
      const res = fn.list ? await fn.list() : await fn.get!();
      return res;
    },
  });
}

export function useMutate<TVars = unknown>(keys: string[], fn: (v: TVars) => Promise<unknown>, msg?: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, TVars>({
    mutationFn: fn,
    onSuccess: () => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      if (msg) toast.success(msg);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
