import requests from "./requests_utils";

export function getTopComments(params) {
    return requests.get(`/comment/getAllComments`, {
        params: params
    })
}


export function insertComment(data) {
    return requests.post(`/comment/createComment?ID=${data.ID}&content=${data.content}`)}

export function getCommentsBy(params) {
    return requests.get(`/comment/getCommentsByWho`, {
        params: params
    })
}

export function updateComment(data) {
    return requests.post(`/comment/update?commentId=${data.commentId}&content=${data.content}`)
}

export function deleteComment(data) {
    return requests.post(`/comment/delete?commentId=${data.commentId}`)
}