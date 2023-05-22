import requests from "./requests_utils";
//
export function listNotifications(data) {
    return requests.post(`/notification/list?toUserId=${data.toUserId}`);
}
