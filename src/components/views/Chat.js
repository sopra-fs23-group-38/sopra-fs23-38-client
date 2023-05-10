import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Divider, Form, Image, Input, message } from "antd";
import { useLocation } from "react-router-dom";
import SockJS from 'sockjs-client';
import styles from "styles/views/chat.module.scss";
import { over } from 'stompjs';
var stompClient = null;
const Chat = () => {

    const location = useLocation();
    const [form] = Form.useForm();
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState({});
    const [socket, setSocket] = useState(null);
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
        var newSocket = new SockJS("http://localhost:8080/my-websocket");
        stompClient = over(newSocket);
        stompClient.connect({}, function () {
            stompClient.subscribe(`/topic/messages/${fromUserId},${toUserId}`, function (msg) {
                let body = JSON.parse(msg.body)
                setMessages(body)
                console.log(body)
            })
            stompClient.send("/app/list/" + fromUserId + "/" + toUserId, {});
        }, connectError);
        setSocket(stompClient);
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

    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
              <Card title={'Chat With Other Users!'} style={{ width: '50%', maxWidth: '756px' }}>
                  <div id={'container'} style={{ maxHeight: '512px', overflowY: 'scroll' }}>
                      {messages.map((message) => (
                        <div key={message.id} style={{ display: 'flex', justifyContent: message.fromUserId === user.id ? 'flex-end' : 'flex-start' }}>
                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                <div
                                  style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      marginRight: '8px',
                                  }}
                                >
                                    <img src={`https://bing.ioliu.cn/v1?d=${message.fromUserId}&w=32&h=32`} alt={'User avatar'} />
                                </div>
                                <div
                                  style={{
                                      padding: '8px',
                                      border: '1px solid #d9d9d9',
                                      borderRadius: '6px',
                                      height: '100%',
                                      wordBreak: 'break-word',
                                      maxWidth: '70%',
                                      backgroundColor: message.fromUserId === user.id ? '#6F3BF5' : '#fff',
                                      color: message.fromUserId === user.id ? '#fff' : '#000',
                                  }}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </div>
                      ))}
                      <Divider />
                      <div ref={messagesEndRef} />
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
