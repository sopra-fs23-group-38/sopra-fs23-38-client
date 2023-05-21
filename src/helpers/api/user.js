import requests from "./requests_utils";

export function register(data) {
    const url = `/register?email=${data.email}&password=${data.password}&username=${data.username}`;
    return requests.post(url);

}

export function login(data) {
    const url = `/login?password=${data.password}&username=${data.username}`;
    return requests.post(url);
    // return requests.post("/usr/login", {
    //     params: data
    // });
    // return requests.post("/usr/login", data);
}

export function getHasNew() {
    return requests.get("/has_new");
}

export function cleanHasNew() {
    return requests.post("/has_new");
}