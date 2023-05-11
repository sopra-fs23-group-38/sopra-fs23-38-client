import requests from "./requests_utils";

export function getTopComments(params) {
    return requests.get(`/comment/getTopComments`, {
        params: params
    })
}


// export function insertComment(data) {
//     return requests.post(`/comment/insertComment?to_comment=${data.to_comment}&to_comment_type=${data.to_comment_type}&content=${data.content}`)}

export function insertComment(data) {
    let url = `/comment/createComment?ID=${data.ID}&content=${data.content}`;

    if(data.parentId !== undefined) {
        url += `&parentId=${data.parentId}`;
    }
    
    return requests.post(url);
}


export function getCommentsBy(params) {
    return requests.get(`/comment/getCommentsBy`, {
        params: params
    })
}

export function updateComment(data) {
    return requests.post(`/comment/update?commentId=${data.commentId}&content=${data.content}`)
}

export function deleteComment(data) {
    return requests.post(`/comment/delete?commentId=${data.commentId}`)
}
