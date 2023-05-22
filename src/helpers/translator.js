import requests from "./requests_utils";

export function translate(data) {
    return requests.post(`/translator/?content=${data.content}&targetLanguage=${data.targetLanguage}`);
}
