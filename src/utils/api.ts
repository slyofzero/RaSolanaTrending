export async function apiFetcher<T>(
  url: string,
  headerObj?: Record<string, string>
) {
  const headers = new Headers(headerObj);
  headers.append("accept", "application/json");
  const response = await fetch(url, { headers });
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function apiPoster<T>(url: string) {
  const response = await fetch(url, { method: "POST" });
  const data = (await response.json()) as T;
  return { response: response.status, data };
}
