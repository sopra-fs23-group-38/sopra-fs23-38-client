import requests from "./requests_utils";

export function getTopComments(params) {
    return requests.get(`/comment/getAllComments`, {
        params: params
    })
}



export function insertComment(data) {
    let url = `/comment/createComment?ID=${data.ID}&content=${data.content}`;

    if(data.parentId !== null) {
        url += `&parentId=${data.parentId}`;
    }

    return requests.post(url);
}
export function getCommentsBy(params) {
    return requests.get(`/comment/getCommentsByWho`, {
        params: params
    })
}

export function updateComment(data) {
    return requests.post(`/comment/update?commentId=${data.commentId}&content=${data.content}`)
}

export function deleteComment(data) {
    return requests.delete(`/comment/delete?commentId=${data.commentId}`)
}