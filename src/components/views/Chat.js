import React, { useState, useEffect} from "react";
import { Button, Card, Divider, Form, Input, message } from "antd";
import { useLocation } from "react-router-dom";
import SockJS from 'sockjs-client';
//import { insertMessage, listMessage } from "helpers/api/message";
import styles from "styles/views/chat.module.scss";
import { over } from 'stompjs';
var stompClient = null;
const Chat = () => {

    
    const location = useLocation();
    const [form] = Form.useForm();
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState({});
    let { fromUserId, toUserId } = location.state || {};
    if (!fromUserId){
        const urlParams = new URLSearchParams(window.location.search);
        fromUserId = urlParams.get('fromUserId');
        toUserId = urlParams.get('toUserId');
    }

    useEffect(() => {
        console.log(fromUserId,toUserId)
        const cUser = JSON.parse(localStorage.getItem("user"));
        setUser(cUser);
        var newSocket = new SockJS("https://sopra-fs23-group-38-server.oa.r.appspot.com/my-websocket");
        stompClient = over(newSocket);
        stompClient.connect({}, function () {
            stompClient.subscribe(`/topic/messages/${fromUserId},${toUserId}`, function (msg) {
                let body = JSON.parse(msg.body)
                if (Array.isArray(body)) {
                    setMessages(body);
                } else {
                    setMessages(prevMessages => [...prevMessages, body]);
                }
            })
            stompClient.send("/app/list/" + fromUserId + "/" + toUserId, {});
        }, connectError);
        // eslint-disable-next-line react-hooks/rules-of-hooks


        return () => {
            newSocket.close();
        };
    }, [fromUserId, toUserId]);
    const connectError= (err) => {
        console.log("网络异常")
        message.error("Web socket Interrupted");
        // alert("Web socket Interrupted")
    }


    const sendMessage = (values) => {
        let { fromUserId, toUserId } = location.state || {};
        if (!fromUserId){
            const urlParams = new URLSearchParams(window.location.search);
            fromUserId = urlParams.get('fromUserId');
            toUserId = urlParams.get('toUserId');
        }
        const message = {
            fromUserId: fromUserId,
            toUserId: toUserId,
            content: values.content,
        };
        stompClient.send("/app/insert/" + fromUserId + "/" + toUserId, {}, JSON.stringify(message));
        form.resetFields();
    };


    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Card title={'Chat With Other Users!'} style={{ width: '70%', maxWidth: '756px' }}>
                    <div id={'container'} style={{ maxHeight: '512px', overflowY: 'scroll' }}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: message.fromUserId === user.id ? 'row-reverse' : 'row',
                                    marginBottom: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        marginRight: message.fromUserId !== user.id ? '8px' : '0',
                                        marginLeft: message.fromUserId === user.id ? '8px' : '0',
                                    }}
                                >
                                    <img
                                        src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${message.fromUserAvatar}`}
                                        alt={'User avatar'}
                                    />
                                </div>
                                <div
                                    style={{
                                        padding: '14px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        wordBreak: 'break-word',
                                        maxWidth: '40ch',
                                        fontSize: '15px',
                                        backgroundColor: message.fromUserId === user.id ? '#6F3BF5' : '#fff',
                                        color: message.fromUserId === user.id ? '#fff' : '#000',
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: message.content.replace(/\n/g, '<br />')
                                    }}
                                >
                                    {/* {message.content} */}
                                </div>
                            </div>
                        ))}
                        <Divider />
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <Form form={form} onFinish={sendMessage}>
                            <Form.Item style={{ marginBottom: 0 }} name={'content'} rules={[{ required: true, message: 'Please input your content.' }]}>
                                <Input.TextArea placeholder={'Type your chat message here:'} />
                            </Form.Item>
                            <div style={{ float: 'right', marginTop: '16px' }}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button htmlType={'submit'} type={'primary'} style={{ backgroundColor: '#6F3BF5' }}>
                                        Send
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
export default Chat
