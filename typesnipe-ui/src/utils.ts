import { Api } from "@/Api";

export function getApi() {
  return new Api({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URI,
    baseApiParams: {
      credentials: "include",
      mode: "cors",
      format: "json",
    },
  });
}
