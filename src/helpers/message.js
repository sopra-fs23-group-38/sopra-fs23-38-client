import requests from "./requests_utils";
//
export function insertMessage(data) {
    return requests.post(`/message/insert?content=${data.content}&fromUserId=${data.fromUserId}&toUserId=${data.toUserId}`);
}
//
export function listMessage(data) {
    return requests.post(`/message/list?fromUserId=${data.fromUserId}&toUserId=${data.toUserId}`);
}
