const DEFAULT_API_URL = "http://localhost:3001";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

type ApiErrorShape = { message?: string };

const buildErrorMessage = async (res: Response): Promise<string> => {
  const fallback = `Request failed: ${res.status}`;
  const err = (await res.json().catch(() => null)) as ApiErrorShape | null;
  return err?.message || fallback;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await buildErrorMessage(res));
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
