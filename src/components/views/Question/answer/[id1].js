import styles from "styles/views/question.create.module.scss";
import { Button, Card, Col, Divider, Form, Image, Input, message, Row, List, Collapse, Avatar, Modal } from "antd";

import React, { useEffect, useState } from "react";
import { getTopComments, insertComment } from "helpers/api/comment";
import axios from "axios";
import useAuth from "helpers/api/auth";
import { useHistory, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import CommentListItem from "./comment";
import renderWithoutReplies from "./c1";

const { Panel } = Collapse;

const requests = axios.create({
    baseURL: "http://localhost:8080",//process.env.API_HOST, // Change to your desired host and port
});
requests.interceptors.request.use(
    (config) => {
        config.headers["content-type"] = "multipart/form-data";
        config.headers["Access-Control-Allow-Origin"] = "*";
        config.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
        config.headers['token'] = Cookies.get('token')
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);
// export function insertComment(data) {
//     let url = `/comment/createComment?ID=${data.ID}&content=${data.content}`;

//     if (data.parentId) {
//       url += `&parentId=${data.parentId}`;
//     }

//     return requests.post(url);
//   }

// export function getTopComments(params) {
//     return requests.get(`/comment/getAllComments`, {
//         params: params
//     })
// }

const AnswerComments = () => {
    useAuth();
    const { id } = useParams(); //从这个网页的url里提取了id；
    const router = useHistory();
    // const { id } = router.query
    const [form] = Form.useForm();
    const [answer, setAnswer] = useState();
    const [comments, setComments] = useState([]);
    const [IsHuifu, setIsHuifu] = useState(false)
    const [cont, setCont] = useState("")
    const [commentid, setCommentid] = useState()


    // console.log(id)
    useEffect(() => {
        const fetchData = async () => {
            console.log("response1.data");
            try {
                const [response1, response2] = await Promise.all([
                    requests.get("/answer/getAnswerById", {
                        params: {
                            ID: id,
                        },
                    }),
                    requests.get("/comment/getAllComments", {
                        params: {
                            ID: id,
                        },
                    }),
                ]);

                setAnswer(response1.data);
                setComments(response2.data || []);
            } catch (error) {
                // 处理错误
                console.error("Error fetching answer and comments:", error);
            }
        };

        fetchData();
    }, [id]);

    const handleReply = (id, username) => {
        form.setFieldsValue({
            content: `About answerid:${id}, Reply to ${username}: ` //用了这个function，form里自动出现这个string
        });
    };

    // const handleClick = (values) => {
    //     console.log(values);
    //     const commentData = {
    //         ID: id,
    //         content: values.content
    //     };
    
    //     if (values.parentId != null) {
    //         commentData.parentId = values.parentId;
    //     }

    //     insertComment({
    //         commentData
    //     }).then((response) => {
    //         if (response.success === 'true') {
    //             message.info('Comment successfully')
    //             form.setFieldsValue({
    //                 content: ''
    //             })
    //             getTopComments({
    //                 ID: id,
    //             }).then(response => {
    //                 if (response.success === 'true') {
    //                     setComments(response.comments)
    //                 }
    //             })
    //         } else {
    //             message.error('Comment failed')
    //         }
    //     });
    // }

    const handleClick = (values) => {

        insertComment({
            ID: id,
            content: values.content
        }).then((response) => {
            if (response.success === 'true') {
                message.info('Comment successfully')
                form.setFieldsValue({
                    content: ''
                })
                getTopComments({
                    ID: id,
                }).then(response => {
                    if (response.success === 'true') {
                        setComments(response.comments)
                    }
                })
            } else {
                message.error('Comment failed')
            }
        });
    };

    const openModel = (id) =>{
        setIsHuifu(true)
        setCommentid(id)
        console.log('id', id)
        console.log('isHUIfu', IsHuifu)
    }

    const huifuButton = id=> (<Button type='primary'  onClick={()=>{
        openModel(id)
    }}>huifu</Button>)
    
    // 
    // const mycomments = [

    //     {
    //         "reply_to": "null",
    //         "author": "User1",
    //         "id": 171,
    //         "time": "May 8, 2023, 11:46:08 AM",
    //         "content": "parnetComment1",
    //         "replies": [
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "wenti2",
    //                 "reply": [
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "wenti3"
    //                     },
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "wenti4"
    //                     }
    //                 ]

    //             },
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "fasdfasdf"
    //             }
    //         ]

    //     },
    //     {
    //         "reply to": "null",
    //         "author": "123",
    //         "id": 171,
    //         "time": "May 8, 2023, 11:46:08 AM",
    //         "content": "fasdfasdf",
    //         "reply": [
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "fasdfasdf",
    //                 "reply": [
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "fasdfasdf"
    //                     },
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "fasdfasdf"
    //                     }
    //                 ]

    //             },
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "fasdfasdf"
    //             }
    //         ]

    //     }, {
    //         "reply to": "null",
    //         "author": "123",
    //         "id": 171,
    //         "time": "May 8, 2023, 11:46:08 AM",
    //         "content": "fasdfasdf",
    //         "reply": [
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "fasdfasdf",
    //                 "reply": [
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "fasdfasdf"
    //                     },
    //                     {
    //                         "reply to": "null",
    //                         "author": "123",
    //                         "id": 169,
    //                         "time": "May 8, 2023, 11:46:08 AM",
    //                         "content": "fasdfasdf"
    //                     }
    //                 ]

    //             },
    //             {
    //                 "reply to": "null",
    //                 "author": "123",
    //                 "id": 169,
    //                 "time": "May 8, 2023, 11:46:08 AM",
    //                 "content": "fasdfasdf"
    //             }
    //         ]

    //     }

    // ]

    // const mycomments = [
    //     {
    //         "replies": [
    //             {
    //                 "replies": [
    //                     {
    //                         "replies": [],
    //                         "author": "User3",
    //                         "id": 186,
    //                         "time": "May 9, 2023, 11:44:10 PM",
    //                         "content": "母评论1的子评论1的子子评论1"
    //                     },
    //                     {
    //                         "replies": [],
    //                         "author": "User7",
    //                         "id": 196,
    //                         "time": "May 9, 2023, 11:51:49 PM",
    //                         "content": "母评论1的子评论1的子子评论2"
    //                     }
    //                 ],
    //                 "author": "User2",
    //                 "id": 184,
    //                 "time": "May 9, 2023, 11:42:42 PM",
    //                 "content": "母评论1的子评论1"
    //             },
    //             {
    //                 "replies": [],
    //                 "author": "User4",
    //                 "id": 194,
    //                 "time": "May 9, 2023, 11:50:08 PM",
    //                 "content": "母评论1的子评论2"
    //             }
    //         ],
    //         "author": "User7",
    //         "id": 182,
    //         "time": "May 9, 2023, 11:40:27 PM",
    //         "content": "母评论1"
    //     },
    //     {
    //         "replies": [
    //             {
    //                 "replies": [
    //                     {
    //                         "replies": [],
    //                         "author": "User3",
    //                         "id": 198,
    //                         "time": "May 9, 2023, 11:53:42 PM",
    //                         "content": "母评论2的子评论1的子子评论1"
    //                     }
    //                 ],
    //                 "author": "User6",
    //                 "id": 190,
    //                 "time": "May 9, 2023, 11:46:30 PM",
    //                 "content": "母评论2的子评论1"
    //             },
    //             {
    //                 "replies": [],
    //                 "author": "User7",
    //                 "id": 192,
    //                 "time": "May 9, 2023, 11:48:14 PM",
    //                 "content": "母评论2的子评论2"
    //             }
    //         ],
    //         "author": "User5",
    //         "id": 188,
    //         "time": "May 9, 2023, 11:45:14 PM",
    //         "content": "母评论2"
    //     },
    //     {
    //         "replies": [
    //             {
    //                 "replies": [],
    //                 "author": "User1",
    //                 "id": 202,
    //                 "time": "May 9, 2023, 11:56:17 PM",
    //                 "content": "母评论3的子评论1"
    //             }
    //         ],
    //         "author": "User2",
    //         "id": 200,
    //         "time": "May 9, 2023, 11:55:27 PM",
    //         "content": "母评论3"
    //     }
    // ]

    const handleBack = () => {
        router.goBack();
    };

    const huifu = (id, comment) => {
        console.log(id, comment)
        //TODO Send HTTP request 

        setCont('')
    }
    // useEffect()
    // console.log(answer)
    const defaultKeys = comments.map((_, index) => String(index));
    return (
        <div className={styles.container}>
            {/* {
                IsHuifu && <Modal title="Basic Modal" open={true} onOk={() => {
                    huifu(commentid, cont)
                    setIsHuifu(false)
                }} onCancel={()=>{setIsHuifu(false)}}>
                    <Input value={cont} onChange={e => {
                        console.log(e)
                        setCont(e.target.value)
                    }} />
                </Modal >
            } */}
            <div className={styles.main}>
                {answer && <Card
                    style={{ width: 765 }}
                    cover={<img style={{ height: '256px', objectFit: 'cover', objectPosition: 'center' }} alt="example" src="https://cdn.pixabay.com/photo/2020/04/19/08/17/watercolor-5062356_960_720.jpg" />}
                >
                    <Row>
                        <Col span={3}>
                            <Image preview={false} width={48} height={48} src={'error'} fallback="data:image/png;base64,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" />
                            <p className={styles.name} style={{ fontSize: '12px', marginTop: '4px' }}>{answer.username}</p>
                        </Col>

                        <Col span={18}>
                            <p style={{ marginTop: '0px' }}>{answer.answer.content}</p>
                        </Col>

                        <Col>
                            <Button onClick={handleBack}>Back</Button>
                        </Col>
                    </Row>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '16px' }}>{comments.length} comments</p>
                        <Divider />
                        {comments.map((item1, index) =>
                            <div key={index} style={{
                                paddingBottom: '10px',
                                paddingTop: '10px',
                                borderWidth: '2px', // Set border width
                                borderStyle: 'solid', // Set border style
                                borderColor: 'transparent', // Make the border transparent   
                            }}>
                                <Collapse defaultActiveKey={defaultKeys} >
                                    <Panel header={item1.author + ":" + item1.content} key={index} >
                                        <CommentListItem item = {item1} index={index} actions={[huifuButton(item1.id)]}/>
                
                                        {item1.replies && item1.replies.length > 0 && (
                                            (() => {
                                                let withReplies = item1.replies.filter(item2 => item2.replies && item2.replies.length > 0);
                                                let withoutReplies = item1.replies.filter(item2 => !item2.replies || item2.replies.length === 0);
                                                 return (
                                                     <Collapse>
                                                         {withReplies.map((item2, index2) => (
                                                             <Panel header={item2.author + ":" + item2.content} key={`main-${index2}`} >
                                                                 <CommentListItem item={item2} index={index2} actions={[huifuButton(item2.id)]} />

                                                                 {item2.replies && item2.replies.length > 0 && (
                                                                     <Collapse>
                                                                         <Panel key={`more-${index2}`} header='more' >
                                                                             <List itemLayout="horizontal">

                                                                                 {item2.replies.map((item3, index3) => (
                                                                                     <List.Item key={item2.id} actions={[huifuButton(item2.id)]}>
                                                                                         <List.Item.Meta
                                                                                             avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index3}`} />}
                                                                                             title={<a href="https://ant.design">{item3.author}</a>}
                                                                                             description={item3.content}
                                                                                         />
                                                                                     </List.Item>
                                                                                 ))}
                                                                             </List>
                                                                         </Panel>
                                                                     </Collapse>
                                                                 )}
                                                             </Panel>
                                                         ))}
                                                         {withoutReplies.length > 0 && (
                                                             <Panel key={`more-${index}`} header='more' >
                                                                 <List itemLayout="horizontal">
                                                                     {
                                                                         withoutReplies.map((item2, index2) =>
                                                                             <CommentListItem item={item2} index={index2} actions={[huifuButton(item2.id)]} />
                                                                         )
                                                                     }
                                                                 </List>
                                                             </Panel>
                                                         )}

                                                     </Collapse>
                                                );
                                            })()
                                        )}
                                    </Panel>
                                </Collapse>
                                
                            </div>
                        )}
                    </div>

                    <div>
                        <Form form={form} onFinish={handleClick}>
                            <Form.Item name={'content'} rules={[{ required: true, message: "please input your comment." }]}>
                                <Input.TextArea placeholder={"Type your comment here:"} size={"large"}></Input.TextArea>
                            </Form.Item>

                            <Form.Item>
                                <Button htmlType={"submit"} type={"primary"} style={{ backgroundColor: '#6F3BF5', float: 'right', marginTop: '16px' }}>Send</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Card>}
            </div>
        </div>
    )

}



export default AnswerComments
