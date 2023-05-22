import requests from "./requests_utils";
//
export function getSomeAnswerNew(params) {
    return requests.get(`/answer/getAllAnstoOneQ`, {
        params: params
    })
}

//
export function getAnswer(params) {
    return requests.get(`/answer/getAnswersByWho`, {
        params: params
    })
}
//
export function newAnswer(data) {
    return requests.post(`/answer/createAnswer?questionID=${data.which_question}&content=${data.content}`, {
        params: data
    })
    // return requests.post(`/answer/newAnswer?which_question=${data.which_question}&content=${data.content}`, data)
}
//
export function evaluate(params) {
    return requests.post(`/answer/vote?ID=${params.ID}&UporDownVote=${params.UporDownVote}`)
}
//
export function getAnswersWriteBy(params) {
    return requests.get(`/answer/getAnswersByWho`, {
        params: params
    })
}
//
export function updateAnswer(data) {
    return requests.post(`/answer/updateAnswer?ID=${data.editId}&newContent=${data.newContent}`)
}
//
export function deleteAnswer(data) {
    return requests.delete(`/answer/deleteAnswer?ID=${data.answerId}`)
}