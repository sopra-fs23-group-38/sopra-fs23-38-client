import requests from "./requests_utils";

export function search(params) {
  return requests.get("/search/", {
    params: {
      ...params,
      searchType: params.searchType,
    },
  });
}

