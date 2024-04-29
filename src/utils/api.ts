export async function apiFetcher<T>(url: string) {
  const response = await fetch(url);
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function apiPoster<T>(url: string) {
  const response = await fetch(url, { method: "POST" });
  const data = (await response.json()) as T;
  return { response: response.status, data };
}
