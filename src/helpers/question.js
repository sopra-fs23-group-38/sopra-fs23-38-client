import requests from "./requests_utils";

export function getTotalPageCount() {
    return requests.get("/question/getHowManyQuestions")
}
//
export function listQuestions(params) {
    return requests.get(`/question/getAllQuestions`, {
        params: params//"pageIndex"="1",没有data
    });
}
//
export function getQuestion(params) {
    return requests.get(`/question/getQuestionById`, {
        params: params
    });
}
//后端不做
export function evaluateQuestion(params) {
    return requests.get(`/question/evaluate`, {
        params: params
    })
}
//
export function newQuestion(data) {
    return requests.post(`/question/createQuestion?description=${data.detail}&title=${data.title}&tag=${data.tag}`)
}
//
export function getQuestionsAskedBy(params) {
    return requests.get(`/question/getQuestionsByWho`, {
        params: params
    })
}
//
export function updateQuestion(data) {
    return requests.post(`/question/updateQuestion?ID=${data.editId}&newTitle=${data.newTitle}&newDescription=${data.detail}`)
}
//
export function deleteQuestion(data) {
    return requests.delete(`/question/deleteQuestion?ID=${data.questionId}`)
}