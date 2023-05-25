import {Button, Card, Form, Input, message, Modal, Tabs} from "antd";
import styles from 'styles/views/center.module.scss';
import {useEffect, useState} from "react";
import {deleteQuestion, getQuestionsAskedBy, updateQuestion} from "helpers/api/question";
import {deleteAnswer, getAnswersWriteBy, updateAnswer} from "helpers/api/answer";
import { deleteComment, getCommentsBy, updateComment } from "helpers/api/comment";
//import {listNotifications} from "helpers/api//notification";
import { Link, useHistory } from "react-router-dom";
import SockJS from "sockjs-client";
import { over } from "stompjs";
var stompClient = null;
const Center = () => {
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState([])
    const [comments, setComments] = useState([])
    const [notifications, setNotifications] = useState([])
    const [userId, setuserId] = useState(null)
    const [usermyselfId, setusermyselfId] = useState(null)
    const history = useHistory();


    
    useEffect(() => {
        const newSocket = new SockJS("https://sopra-fs23-group-38-server.oa.r.appspot.com/my-websocket");
        // let stompClient;
        stompClient = over(newSocket);
        setuserId(parseInt(window.location.href.split('/').pop().substring(1)) / 3)
        setusermyselfId(JSON.parse(localStorage.getItem("user")).id)

        console.log(userId,usermyselfId)
        getQuestionsAskedBy({who_asks: parseInt(window.location.href.split('/').pop().substring(1)) / 3}).then(response => {
            // console.log("1111")
            setQuestions(response)
            // console.log(questions)

        })

        getAnswersWriteBy({answererID: parseInt(window.location.href.split('/').pop().substring(1)) / 3}).then(response => {
            setAnswers(response)
        })

        getCommentsBy({ who_comments: parseInt(window.location.href.split('/').pop().substring(1)) / 3 }).then(response => {
            setComments(response)
        })
        if (JSON.parse(localStorage.getItem("user")).id ===parseInt(window.location.href.split('/').pop().substring(1)) / 3){


            const user = JSON.parse(localStorage.getItem("user"));
            const toUserId = user.id;
            stompClient.connect({}, () => {
                // 订阅通知主题
                stompClient.subscribe("/topic/notifications/"+toUserId, (msg) => {
                    const body = JSON.parse(msg.body);
                    setNotifications(body);
                });
            });
            setTimeout(() => {
                // eslint-disable-next-line no-unused-expressions
                stompClient.send("/app/listNotifications", {}, JSON.stringify({ toUserId }));
            }, 500); // 延迟1秒
            // stompClient.send("/app/listNotifications", {}, JSON.stringify({ toUserId }));

        //     const timer = setInterval(() => {
        //     const user = JSON.parse(localStorage.getItem("user"))
        //     listNotifications({ toUserId: user.id }).then(response => {
        //         setNotifications(response)
        //         console.log(response)
        //     })
        // }, 1000);
        //
        //
        // return () => clearInterval(timer);
        }
    }, []);


    const [editQuestionOpen, setEditQuestionOpen] = useState(false)
    const [question, setQuestion] = useState({})

    const deleteQuestionById = (id) => {

        deleteQuestion({
            questionId: id
        }).then(response => {
            if (response.success && response.success === 'true') {
                message.info('Success')
                setTimeout(() => {
                    stompClient.send("/app/getHowManyQuestions/", {});
                    stompClient.send("/app/getAllQuestions/" + 1+"/", {});
                    console.log(id)
                    

                }, 500);
                setQuestions(prevState => {
                    return prevState.filter((item) => {
                        if (item.questionId !== id) {
                            return item;
                        }
                        return null;
                    })
                })
            } else {
                message.error('Failed')
            }
        })
    }

    const editQuestion = (values) => {
        updateQuestion({
            editId: question.questionId,
            newTitle: values.title,
            detail: values.question
        }).then(response => {
            if (response.success && response.success === 'true') {
                message.info('Success');
                if (stompClient && stompClient.connected ) { // 确保WebSocket连接已建立
                setTimeout(() => {
                    stompClient.send("/app/getHowManyQuestions/", {});
                    stompClient.send("/app/getAllQuestions/" + 1+"/", {});
                    stompClient.send("/app/getQuestionById", {}, JSON.stringify({ ID: question.questionId }));
                    stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: question.questionId }));
                }, 500);}

                setEditQuestionOpen(false);
                setQuestions(prevState => {
                    const updatedQuestions = prevState.map((item) => {
                        if (item.questionId === question.questionId) {
                            return { ...item, title: values.title };
                        }
                        return item;
                    });
                    return updatedQuestions;
                });
            } else {
                message.error('Failed');
            }
        });
    };

    const [editAnswerOpen, setEditAnswerOpen] = useState(false)
    const [answer, setAnswer] = useState({})

    const deleteAnswerById = (id) => {
        deleteAnswer({
            answerId: id
        }).then(response => {
            if (response.success && response.success === 'true') {
                setTimeout(() => {
                    // eslint-disable-next-line no-unused-expressions
                    stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: answer.questionId }));
                    
                }, 500); // 延迟1秒
                message.info('Success')
                setAnswers(prevState => {
                    return prevState.filter((item) => {
                        if (item.answerId !== id) {
                            return item;
                        }
                        return null;
                    })
                })
            } else {
                message.error('Failed')
            }
        })
    }

    const editAnswer = (values) => {
        console.log(answer)
        updateAnswer({
            editId: answer.answerId,
            newContent: values.answer
        }).then(response => {
            if (response.success && response.success === 'true') {
                setTimeout(() => {
                    // eslint-disable-next-line no-unused-expressions
                    stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: answer.questionId }));
                    stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: answer.answerId }));
                    stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: answer.answerId }));
                }, 500); // 延迟1秒
                message.info('Success');
                setEditAnswerOpen(false);
                setAnswers(prevState => {
                    const updatedAnswers = prevState.map((item) => {
                        if (item.answerId === answer.answerId) {
                            return { ...item, content: values.answer };
                        }
                        return item;
                    });
                    return updatedAnswers;
                });
            } else {
                message.error('Failed');
            }
        });
    };


    const [editCommentOpen, setEditCommentOpen] = useState(false)
    const [comment, setComment] = useState({})

    const deleteCommentById = (id) => {
        deleteComment({
            commentId: id
        }).then(response => {
            if (response.success && response.success === 'true') {
                message.info('Success')
                setTimeout(() => {
                    console.log(answer)
                    // eslint-disable-next-line no-unused-expressions
                    // stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: answer.questionId }));
                    stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: comment.clickId  }));
                    stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: comment.clickId  }));
                }, 500); // 延迟1秒
                setComments(prevState => {
                    return prevState.filter((item) => {
                        if (item.commentId !== id) {
                            return item;
                        }
                        return null;
                    })
                })
            } else {
                message.error('Failed')
            }
        })
    }

    const editComment = (values) => {
        updateComment({
            commentId: comment.commentId,
            content: values.comment
        }).then(response => {
            if (response.success && response.success === 'true') {
                message.info('Success');
                setTimeout(() => {
                    // eslint-disable-next-line no-unused-expressions
                    console.log(comment)
                    // stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: answer.questionId }));
                    stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: comment.clickId }));
                    stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: comment.clickId }));
                }, 500); // 延迟1秒
                setEditCommentOpen(false);
                setComments(prevState => {
                    const updatedComments = prevState.map((item) => {
                        if (item.commentId === comment.commentId) {
                            return { ...item, commentContent: values.comment };
                        }
                        return item;
                    });
                    return updatedComments;
                });
            } else {
                message.error('Failed');
            }
        });
    };

    const items = [
        {
            key: "1",
            label: (
              <Button
                style={{ backgroundColor: "#6F3BF5", width: "200px" }}
                type={"primary"}
              >
                  Your Questions
              </Button>
            ),
            children: (
              <Card bodyStyle={{ padding: "64px 5%", textAlign: "left" }}>
                  {questions && questions.length === 0 ? (
                    <span>You don't seem to have asked any questions yet.</span>
                  ) : (
                    <div>
                        {questions.map((item, index) => {
                            return (
                              <Card
                                key={index}
                                style={{ marginTop: "8px", position: "relative" }}
                              >
                                  {/* Make the title bold and display it above the Card */}
                                  <div>
                      <span
                        style={{
                            fontWeight: "bold",
                            fontFamily: "Arial, sans-serif",
                        }}
                      >
                        Title:{" "}
                          <Link
                            to={`/question/${item.questionId}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                          {item.title}
                        </Link>
                      </span>
                                      <br />
                                      <span style={{ fontFamily: "Arial, sans-serif" }}>
                        Answers: {item.answer_count || 0}
                      </span>
                                      <span
                                        style={{
                                            marginLeft: "16px",
                                            fontFamily: "Arial, sans-serif",
                                        }}
                                      >
                        Last Updated:{" "}
                                          {item.lastChangeTime
                                            ? new Date(item.lastChangeTime).toLocaleDateString(
                                              undefined,
                                              {
                                                  year: "numeric",
                                                  month: "numeric",
                                                  day: "numeric",
                                              }
                                            )
                                            : "N/A"}
                      </span>
                                  </div>

                                  <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "8px",
                                        transform: "translateY(-50%)",
                                    }}
                                  >
                                        <Button
                                            onClick={() => {
                                                if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                    setEditQuestionOpen(true);
                                                    setQuestion(item);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) ? "#6F3BF5" : "#ccc", // Change color based on condition
                                                marginRight: "8px",
                                                marginLeft: "8px",
                                            }}
                                            type={"primary"}
                                            disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                    deleteQuestionById(item.questionId)
                                                }
                                            }}
                                            type={"primary"}
                                            danger
                                            disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                        >
                                            Delete
                                        </Button>
                                  </div>
                              </Card>
                            );
                        })}
                    </div>
                  )}
              </Card>
            ),
        },
        {
            key: '2',
            label: (
                <Button style={{ backgroundColor: '#6F3BF5', width: '200px' }} type={"primary"}>Your Answers</Button>
            ),
            children: (
                <Card bodyStyle={{ padding: '64px 5%', textAlign: "left" }}>
                    {answers && answers.length === 0
                        ? <span>You don't seem to have asked any answer yet.</span>
                        : <div>
                            {answers.map((item, index) => {
                                return <Card
                                    key={index}
                                    style={{ marginTop: "8px", position: "relative" }}
                                >
                                    <div>
                                        <span
                                            style={{
                                                fontWeight: "bold",
                                                fontFamily: "Arial, sans-serif",
                                            }}
                                        >
                                            Question Title: {item.questionTitle}
                                        </span>
                                         <Link to={`/question/answer/${item.answerId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <span>Your Answer: {item.content}</span>
                                        </Link>
                                        <span style={{ fontFamily: "Arial, sans-serif" }}>
                                            Last Updated:{" "}
                                            {item.change_time
                                                ? new Date(item.change_time).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: "numeric",
                                                        month: "numeric",
                                                        day: "numeric",
                                                    }
                                                )
                                                : "N/A"}
                                        </span>
                                        <span
                                            style={{
                                                marginLeft: "16px",
                                                fontFamily: "Arial, sans-serif",
                                            }}
                                        >
                                            Vote: {item.vote_count || 0}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            right: "8px",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <Button
                                            onClick={() => {
                                                if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                    console.log(item)
                                                    setEditAnswerOpen(true)
                                                    setAnswer(item)
                                                }
                                            }}
                                            style={{
                                                backgroundColor: (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) ? "#6F3BF5" : "#ccc", // Change color based on condition
                                                marginRight: '8px',
                                                marginLeft: '8px',
                                            }}
                                            type={"primary"}
                                            disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                    deleteAnswerById(item.answerId)
                                                }
                                            }}
                                            type={"primary"}
                                            danger
                                            disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                        >
                                            Delete
                                        </Button>

                                    </div>
                                </Card>
                            })}
                        </div>}
                </Card>
            )
        },
        {
            key: '3',
            label: (
                <Button style={{ backgroundColor: '#6F3BF5', width: '200px' }} type={"primary"}>Your Comments</Button>
            ),
            children: (
                <Card bodyStyle={{ padding: '64px 5%'}}>
                    { comments && comments.length === 0
                        ? <span>You don't seem to have asked any comment yet.</span>
                        : <div>
                            { comments.map((item, index) => {
                                console.log(item);
                                return <Card
                                    key={index}
                                    style={{ marginTop: "8px", position: "relative" }}
                                >
                                    
                                    <div style={{ textAlign: "left" }}>
                                        <span
                                            style={{
                                                fontWeight: "bold",
                                                fontFamily: "Arial, sans-serif",
                                            }}
                                        >
                                            Answer: {item.comment_ans}
                                        </span>
                                        <br />
                                        <span>Your Comment: {item.commentContent}</span>
                                        <br />
                                        <span style={{ fontFamily: "Arial, sans-serif" }}>
                                            Last Updated:{" "}
                                            {item.commentTime
                                                ? new Date(item.commentTime).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: "numeric",
                                                        month: "numeric",
                                                        day: "numeric",
                                                    }
                                                )
                                                : "N/A"}
                                        </span>
                                    </div>

                                        <div style={{ position: "absolute", right: "8px" }}>
                                            <Button
                                                onClick={() => {
                                                    if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                        setEditCommentOpen(true)
                                                        setComment(item)
                                                    }
                                                }}
                                                style={{
                                                    backgroundColor: (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) ? "#6F3BF5" : "#ccc", // Change color based on condition
                                                    marginRight: '8px',
                                                    marginLeft: '8px',
                                                }}
                                                type={"primary"}
                                                disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id) {
                                                        deleteCommentById(item.commentId)
                                                    }
                                                }}
                                                type={"primary"}
                                                danger
                                                disabled={!(parseInt(window.location.href.split('/').pop().substring(1)) / 3 === JSON.parse(localStorage.getItem("user")).id)} // Disable button based on condition
                                            >
                                                Delete
                                            </Button>

                                        </div>
                                    
                                </Card>
                            }) }
                        </div>}
                </Card>
            )
        },
        {
            key: '4',
            label: (
                <Button style={{ backgroundColor: '#6F3BF5', width: '200px' }} type={"primary"}>Your Notifications</Button>
            ),
            children: (
                <Card bodyStyle={{ padding: '64px 5%'}}>
                    { notifications && notifications.length === 0
                        ? <span>You don't seem to have notification yet.</span>
                        : <div>
                            { notifications.map((item, index) => {
                                return <Card key={index} style={{ marginTop: '8px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <div>
                                            { item.content }
                                        </div>

                                        <div style={{ position: 'absolute', right: '8px' }}>
                                            <Button onClick={() => history.push(item.url)} type={"primary"}>skip</Button>
                                        </div>
                                    </div>
                                </Card>
                            }) }
                        </div>}
                </Card>
            )
        },
    ]

    return (
        <div className={styles.container}>
            <p className={styles.title}>User Center</p>

            <Button onClick={() => {
                if (parseInt(window.location.href.split('/').pop().substring(1)) / 3 !== JSON.parse(localStorage.getItem("user")).id) {
                history.push({
                pathname: "/chat", state: { fromUserId: JSON.parse(localStorage.getItem("user")).id, toUserId: parseInt(window.location.href.split('/').pop().substring(1)) / 3 }
            })}}} type={"primary"}>chat</Button>

            <Tabs tabPosition={"left"} items={items} />
            <Modal
              destroyOnClose={true}
              open={editQuestionOpen}
              onCancel={() => {
                  setEditQuestionOpen(false);
                  setQuestion({});
              }}
              title={"Edit Question"}
              footer={null}
            >
                <Form onFinish={editQuestion}>
                    <Form.Item
                      initialValue={question.title}
                      name={"title"}
                      rules={[{ required: true, message: "please input your question." }]}
                    >
                        <Input placeholder={"Input Title"} />
                    </Form.Item>

                    <Form.Item
                      initialValue={question.detail}
                      name={"question"}
                      rules={[{ required: true, message: "please input your question." }]}
                    >
                        <Input placeholder={"Input Question"} />
                    </Form.Item>

                    <div style={{ position: "relative", height: "32px" }}>
                        <Form.Item style={{ position: "absolute", right: "0" }}>
                            <Button htmlType={"submit"} type={"primary"}>
                                Ok
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
              destroyOnClose={true}
              open={editCommentOpen}
              onCancel={() => {
                  setEditCommentOpen(false);
                  setComment({});
              }}
              title={"Edit Comment"}
              footer={null}
            >
                <Form onFinish={editQuestion}>
                    <Form.Item
                      initialValue={question.title}
                      name={"comment"}
                      rules={[{ required: true, message: "please input your comment." }]}
                    >
                        <Input placeholder={"Input Comment"} />
                    </Form.Item>

                    <div style={{ position: "relative", height: "32px" }}>
                        <Form.Item style={{ position: "absolute", right: "0" }}>
                            <Button htmlType={"submit"} type={"primary"}>
                                Ok
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
              destroyOnClose={true}
              open={editCommentOpen}
              onCancel={() => {
                  setEditCommentOpen(false);
                  setComment({});
              }}
              title={"Edit Comment"}
              footer={null}
            >
                <Form onFinish={editComment}>
                    <Form.Item
                      initialValue={comment.commentContent}
                      name={"comment"}
                      rules={[{ required: true, message: "please input your comment." }]}
                    >
                        <Input placeholder={"Input Comment"} />
                    </Form.Item>

                    <div style={{ position: "relative", height: "32px" }}>
                        <Form.Item style={{ position: "absolute", right: "0" }}>
                            <Button htmlType={"submit"} type={"primary"}>
                                Ok
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
              destroyOnClose={true}
              open={editAnswerOpen}
              onCancel={() => {
                  setEditAnswerOpen(false);
                  setAnswer({});
              }}
              title={"Edit Answer"}
              footer={null}
            >
                <Form onFinish={editAnswer}>
                    <Form.Item
                      initialValue={answer.answerContent}
                      name={"answer"}
                      rules={[{ required: true, message: "please input your answer." }]}
                    >
                        <Input placeholder={"Input Answer"} />
                    </Form.Item>

                    <div style={{ position: "relative", height: "32px" }}>
                        <Form.Item style={{ position: "absolute", right: "0" }}>
                            <Button htmlType={"submit"} type={"primary"}>
                                Ok
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Center;
