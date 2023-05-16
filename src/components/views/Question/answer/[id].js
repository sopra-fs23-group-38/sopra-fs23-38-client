import styles from "styles/views/question.create.module.scss";
import { Button, Card, Col, Divider, Form, Image, Input, message, Row, List, Collapse, Avatar, Modal } from "antd";
import React, { useEffect, useState,useRef } from "react";
import { getTopComments, insertComment } from "helpers/api/comment";
import axios from "axios";
import useAuth from "helpers/api/auth";
import { useHistory, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import CommentListItem from "./comment";
import SockJS from "sockjs-client";
import { over } from "stompjs";


const { Panel } = Collapse;

const requests = axios.create({
    baseURL: "http://localhost:8080",//"https://sopra-fs23-group-38-server.oa.r.appspot.com/", // Change to your desired host and port
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

var stompClient = null;
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
    const formRef = useRef(null);
    const [parentId, setParentId] = useState(null);
    const [placeholder, setPlaceholder] = useState("Type your comment here:");

    useEffect(() => {
        const newSocket = new SockJS("http://localhost:8080/my-websocket");
        stompClient = over(newSocket);
        stompClient.connect({}, function() {
            stompClient.subscribe("/topic/getAnswerById/"+id, function(msg) {
                let body = JSON.parse(msg.body)
                setAnswer(body);
            })
            stompClient.subscribe("/topic/getAllComments/"+id, function(msg) {
                let body = JSON.parse(msg.body)
                setComments(body || []);
                // console.log(body)
            })
            // stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: id }));
            // stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: id }));

            // eslint-disable-next-line no-use-before-define
        }, connectError);
        const connectError = (err) => {
            console.log("网络异常")
            message.error("Web socket Interrupted");
            setTimeout(() => {
                console.log("Attempting to reconnect...");
                const newSocket = new SockJS("http://localhost:8080/my-websocket");
                stompClient = over(newSocket);
            }, 3000);
        };

        // // console.log(user)
        // if (id !== undefined && id !== "undefined") {
        //     console.log(id)
        //     console.log("Fetching data with websocket...");
        //     setTimeout(() => {
        //         // eslint-disable-next-line no-unused-expressions
        //         stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: id }));
        //         stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: id }));
        //     }, 10000); // 延迟1秒
        // }

        // return () => {
        //     newSocket.close();
        // };
    }, [id]);
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("00000")
            if (stompClient !== null) {
                stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: id }));
                stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: id }));
        }}, 1000)

        // 清除定时器
        return () => {clearTimeout(timer);}
    }, [id]);

    // console.log(id)
    // useEffect(() => {
    //     const fetchData = async () => {
    //         console.log("response1.data");
    //         try {
    //             const [response1, response2] = await Promise.all([
    //                 requests.get("/answer/getAnswerById", {
    //                     params: {
    //                         ID: id,
    //                     },
    //                 }),
    //                 requests.get("/comment/getAllComments", {
    //                     params: {
    //                         ID: id,
    //                     },
    //                 }),
    //             ]);
    //
    //             setAnswer(response1.data);
    //             setComments(response2.data || []);
    //         } catch (error) {
    //             // 处理错误
    //             console.error("Error fetching answer and comments:", error);
    //         }
    //     };

    //     fetchData();
    // }, [id]);

    const handleReply = (comment) => {
        setParentId(comment.id);
        setPlaceholder(`Reply to ${comment.content}: `);
    };

    const handleClick = (values) => {

        insertComment({
            ID: id,
            content: values.content,
            parentId: parentId
        }).then((response) => {
            if (response.success === 'true') {
                message.info('Comment successfully')
                setTimeout(() => {
                    // eslint-disable-next-line no-unused-expressions
                    stompClient.send("/app/getAnswerById", {}, JSON.stringify({ ID: id }));
                    stompClient.send("/app/getAllComments", {}, JSON.stringify({ ID: id }));
                    stompClient.send("/app/getAllAnstoOneQ", {}, JSON.stringify({ pageIndex: 1, questionID: answer.questionId }));
                }, 500); // 延迟1秒
                form.setFieldsValue({
                    content: ''
                })
                setParentId(null);
                setPlaceholder("Type your comment here:");
                getTopComments({
                    ID: id,
                }).then(response => {
                    if (response.success === 'true') {
                        setComments(response.comments)
                        window.location.reload();
                    }
                })
            } else {
                message.error('Comment failed')
            }
        });
    };


    const huifuButton = (comment) =>
      (<Button type='primary' onClick={() => {
          handleReply(comment);
          formRef.current.scrollIntoView({ behavior: 'smooth' });
      }}>Reply</Button>)

    const handleBack = () => {
        router.goBack();
    };


    const defaultKeys = comments.map((_, index) => String(index));
    return (
      <div className={styles.container}>

          <div className={styles.main}>
              {answer && <Card
                style={{ width: 800 }}
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
                      {comments.map((item1, index) => //layer 1 (parent)
                        <div key={index} style={{
                            paddingBottom: '10px',
                            paddingTop: '10px',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: 'transparent',
                        }}>
                            <Collapse defaultActiveKey={defaultKeys} >
                                <Panel header={item1.author + ":" + item1.content} key={index} >
                                    <CommentListItem item = {item1} actions={[huifuButton(item1)]}/>
                                    {item1.replies && item1.replies.length > 0 && (
                                      (() => {
                                          let withReplies = item1.replies.filter(item2 => item2.replies && item2.replies.length > 0);
                                          let withoutReplies = item1.replies.filter(item2 => !item2.replies || item2.replies.length === 0);
                                          return (
                                            <Collapse>
                                                {withReplies.map((item2, index2) => ( //layer 2
                                                  <Panel header={item2.author + " to " + item1.author} key={`main-${index2}`} >
                                                      <CommentListItem item={item2}  actions={[huifuButton(item2)]} />
                                                      {item2.replies && item2.replies.length > 0 && (
                                                        (() => {
                                                            let withReplies1 = item2.replies.filter(item3 => item3.replies && item3.replies.length > 0);
                                                            let withoutReplies1 = item2.replies.filter(item3 => !item3.replies || item3.replies.length === 0);
                                                            return (
                                                              <Collapse>
                                                                  {withReplies1.map((item3, index3) => ( //layer 3
                                                                    <Panel header={item3.author + " to " + item2.author} key={`main-${index3}`} >
                                                                        <CommentListItem item={item3} actions={[huifuButton(item3)]} />
                                                                        {item3.replies && item3.replies.length > 0 && (
                                                                          (() => {
                                                                              let withReplies2 = item3.replies.filter(item4 => item4.replies && item4.replies.length > 0);
                                                                              let withoutReplies2 = item3.replies.filter(item4 => !item4.replies || item4.replies.length === 0);
                                                                              return (
                                                                                <Collapse>
                                                                                    {withReplies2.map((item4,index4) => ( //layer 4
                                                                                      <Panel header={item4.author + " to " + item3.author} key={`main-${index4}`} >
                                                                                          <CommentListItem item={item4} actions={[huifuButton(item4)]} />
                                                                                          {item4.replies && item4.replies.length > 0 && (
                                                                                            (() => {
                                                                                                let withReplies3 = item4.replies.filter(item5 => item5.replies && item5.replies.length > 0);
                                                                                                let withoutReplies3 = item4.replies.filter(item5 => !item5.replies || item5.replies.length === 0);
                                                                                                return (
                                                                                                  <Collapse>
                                                                                                      {withReplies3.map((item5,index5) => ( //layer 5
                                                                                                        <Panel header={item5.author + " to " + item4.author} key={`main-${index5}`} >
                                                                                                            <CommentListItem item={item5} actions={[huifuButton(item5)]} />
                                                                                                            {item5.replies && item5.replies.length > 0 && (
                                                                                                              (() => {
                                                                                                                  let withReplies4 = item5.replies.filter(item6 => item6.replies && item6.replies.length > 0);
                                                                                                                  let withoutReplies4 = item5.replies.filter(item6 => !item6.replies || item6.replies.length === 0);
                                                                                                                  return (
                                                                                                                    <Collapse>
                                                                                                                        {withReplies4.map((item6,index6) => ( //layer 6
                                                                                                                          <Panel header={item6.author + " to " + item5.author} key={`main-${index6}`} >
                                                                                                                              <CommentListItem item={item6} actions={[huifuButton(item6)]} />
                                                                                                                              {item6.replies && item6.replies.length > 0 && (
                                                                                                                                (() => {
                                                                                                                                    let withReplies5 = item6.replies.filter(item7 => item7.replies && item7.replies.length > 0);
                                                                                                                                    let withoutReplies5 = item6.replies.filter(item7 => !item7.replies || item7.replies.length === 0);
                                                                                                                                    return (
                                                                                                                                      <Collapse>
                                                                                                                                          {withReplies5.map((item7,index7) => ( //layer 7
                                                                                                                                            <Panel header={item7.author + " to " + item6.author} key={`main-${index7}`} >
                                                                                                                                                <CommentListItem item={item7} actions={[huifuButton(item7)]} />
                                                                                                                                                {item7.replies && item7.replies.length > 0 && (
                                                                                                                                                  (() => {
                                                                                                                                                      let withReplies6 = item7.replies.filter(item8 => item8.replies && item8.replies.length > 0);
                                                                                                                                                      let withoutReplies6 = item7.replies.filter(item8 => !item8.replies || item8.replies.length === 0);
                                                                                                                                                      return (
                                                                                                                                                        <Collapse>
                                                                                                                                                            {withReplies6.map((item8,index8) => ( //layer 8
                                                                                                                                                              <Panel header={item8.author + " to " + item7.author} key={`main-${index8}`} >
                                                                                                                                                                  <CommentListItem item={item8} actions={[huifuButton(item8)]} />
                                                                                                                                                                  {item8.replies && item8.replies.length > 0 && (
                                                                                                                                                                    (() => {
                                                                                                                                                                        let withReplies7 = item8.replies.filter(item9 => item9.replies && item9.replies.length > 0);
                                                                                                                                                                        let withoutReplies7 = item8.replies.filter(item9 => !item8.replies || item9.replies.length === 0);
                                                                                                                                                                        return (
                                                                                                                                                                          <Collapse>
                                                                                                                                                                              {withReplies7.map((item9,index9) => ( //layer 9
                                                                                                                                                                                <Panel header={item9.author + " to " + item8.author} key={`main-${index9}`} >
                                                                                                                                                                                    <CommentListItem item={item9} actions={[huifuButton(item9)]} />
                                                                                                                                                                                    {item9.replies && item9.replies.length > 0 && (
                                                                                                                                                                                      (() => {
                                                                                                                                                                                          let withReplies8 = item9.replies.filter(item10 => item10.replies && item10.replies.length > 0);
                                                                                                                                                                                          let withoutReplies8 = item9.replies.filter(item10 => !item10.replies || item10.replies.length === 0);
                                                                                                                                                                                          return (
                                                                                                                                                                                            <Collapse>
                                                                                                                                                                                                {withReplies8.map((item10, index10) => ( //layer 10
                                                                                                                                                                                                  <Panel header={item10.author + " to " + item9.author} key={`main-${index10}`} >
                                                                                                                                                                                                      <CommentListItem item={item10} actions={[huifuButton(item10)]} />
                                                                                                                                                                                                      {item10.replies && item10.replies.length > 0 && (
                                                                                                                                                                                                        (() => {
                                                                                                                                                                                                            let withReplies9 = item10.replies.filter(item11 => item11.replies && item11.replies.length > 0);
                                                                                                                                                                                                            let withoutReplies9 = item10.replies.filter(item11 => !item11.replies || item11.replies.length === 0);
                                                                                                                                                                                                            return (
                                                                                                                                                                                                              <Collapse>
                                                                                                                                                                                                                  {withReplies9.map((item11, index11) => ( //layer 11
                                                                                                                                                                                                                    <Panel header={item11.author + " to " + item10.author} key={`main-${index11}`} >
                                                                                                                                                                                                                        <CommentListItem item={item11} actions={[huifuButton(item11)]} />
                                                                                                                                                                                                                        {item11.replies && item11.replies.length > 0 && (
                                                                                                                                                                                                                          (() => {
                                                                                                                                                                                                                              let withReplies10 = item11.replies.filter(item12 => item12.replies && item12.replies.length > 0);
                                                                                                                                                                                                                              let withoutReplies10 = item11.replies.filter(item12 => !item12.replies || item12.replies.length === 0);
                                                                                                                                                                                                                              return (
                                                                                                                                                                                                                                <Collapse>
                                                                                                                                                                                                                                    {withReplies10.map((item12, index12) => ( //layer 12
                                                                                                                                                                                                                                      <Panel header={item12.author + " to " + item11.author} key={`main-${index12}`} >
                                                                                                                                                                                                                                          <CommentListItem item={item12} actions={[huifuButton(item12)]} />
                                                                                                                                                                                                                                          {item12.replies && item12.replies.length > 0 && (
                                                                                                                                                                                                                                            (() => {
                                                                                                                                                                                                                                                let withReplies11 = item12.replies.filter(item13 => item13.replies && item13.replies.length > 0);
                                                                                                                                                                                                                                                let withoutReplies11 = item12.replies.filter(item13 => !item13.replies || item13.replies.length === 0);
                                                                                                                                                                                                                                                return (
                                                                                                                                                                                                                                                  <Collapse>
                                                                                                                                                                                                                                                      {withReplies11.map((item13, index13) => ( //layer 13
                                                                                                                                                                                                                                                        <Panel header={item13.author + " to " + item12.author} key={`main-${index13}`} >
                                                                                                                                                                                                                                                            <CommentListItem item={item13} actions={[huifuButton(item13)]} />
                                                                                                                                                                                                                                                            {item13.replies && item13.replies.length > 0 && (
                                                                                                                                                                                                                                                              (() => {
                                                                                                                                                                                                                                                                  let withReplies12 = item13.replies.filter(item14 => item14.replies && item14.replies.length > 0);
                                                                                                                                                                                                                                                                  let withoutReplies12 = item13.replies.filter(item14 => !item14.replies || item14.replies.length === 0);
                                                                                                                                                                                                                                                                  return (
                                                                                                                                                                                                                                                                    <Collapse>
                                                                                                                                                                                                                                                                        {withReplies12.map((item14, index14) => ( //layer 14
                                                                                                                                                                                                                                                                          <Panel header={item14.author + " to " + item13.author} key={`main-${index14}`} >
                                                                                                                                                                                                                                                                              <CommentListItem item={item14} actions={[huifuButton(item14)]} />
                                                                                                                                                                                                                                                                              {item14.replies && item14.replies.length > 0 && (
                                                                                                                                                                                                                                                                                (() => {
                                                                                                                                                                                                                                                                                    let withReplies13 = item14.replies.filter(item15 => item15.replies && item15.replies.length > 0);
                                                                                                                                                                                                                                                                                    let withoutReplies13 = item14.replies.filter(item15 => !item15.replies || item15.replies.length === 0);
                                                                                                                                                                                                                                                                                    return (
                                                                                                                                                                                                                                                                                      <Collapse>
                                                                                                                                                                                                                                                                                          {withReplies13.map((item15, index15) => ( //layer 15
                                                                                                                                                                                                                                                                                            <Panel header={item15.author + " to " + item14.author} key={`main-${index15}`} >
                                                                                                                                                                                                                                                                                                <CommentListItem item={item15} actions={[huifuButton(item15)]} />
                                                                                                                                                                                                                                                                                            </Panel>))}
                                                                                                                                                                                                                                                                                          {withoutReplies13.length > 0 && (
                                                                                                                                                                                                                                                                                            <Panel key={`more-${index14}`} header='more' >
                                                                                                                                                                                                                                                                                                <List itemLayout="horizontal">
                                                                                                                                                                                                                                                                                                    {withoutReplies13.map((item15) =>
                                                                                                                                                                                                                                                                                                      <CommentListItem item={item15} actions={[huifuButton(item15)]} />)}
                                                                                                                                                                                                                                                                                                </List>
                                                                                                                                                                                                                                                                                            </Panel>)}
                                                                                                                                                                                                                                                                                      </Collapse>);})())}
                                                                                                                                                                                                                                                                          </Panel>))}
                                                                                                                                                                                                                                                                        {withoutReplies12.length > 0 && (
                                                                                                                                                                                                                                                                          <Panel key={`more-${index13}`} header='more' >
                                                                                                                                                                                                                                                                              <List itemLayout="horizontal">
                                                                                                                                                                                                                                                                                  {withoutReplies12.map((item14) =>
                                                                                                                                                                                                                                                                                    <CommentListItem item={item14} actions={[huifuButton(item14)]} />)}
                                                                                                                                                                                                                                                                              </List>
                                                                                                                                                                                                                                                                          </Panel>)}
                                                                                                                                                                                                                                                                    </Collapse>);})())}
                                                                                                                                                                                                                                                        </Panel>))}
                                                                                                                                                                                                                                                      {withoutReplies11.length > 0 && (
                                                                                                                                                                                                                                                        <Panel key={`more-${index12}`} header='more' >
                                                                                                                                                                                                                                                            <List itemLayout="horizontal">
                                                                                                                                                                                                                                                                {withoutReplies11.map((item13) =>
                                                                                                                                                                                                                                                                  <CommentListItem item={item13} actions={[huifuButton(item13)]} />)}
                                                                                                                                                                                                                                                            </List>
                                                                                                                                                                                                                                                        </Panel>)}
                                                                                                                                                                                                                                                  </Collapse>);})())}
                                                                                                                                                                                                                                      </Panel>))}
                                                                                                                                                                                                                                    {withoutReplies10.length > 0 && (
                                                                                                                                                                                                                                      <Panel key={`more-${index11}`} header='more' >
                                                                                                                                                                                                                                          <List itemLayout="horizontal">
                                                                                                                                                                                                                                              {withoutReplies10.map((item12) =>
                                                                                                                                                                                                                                                <CommentListItem item={item12} actions={[huifuButton(item12)]} />)}
                                                                                                                                                                                                                                          </List>
                                                                                                                                                                                                                                      </Panel>)}
                                                                                                                                                                                                                                </Collapse>);})())}
                                                                                                                                                                                                                    </Panel>))}
                                                                                                                                                                                                                  {withoutReplies9.length > 0 && (
                                                                                                                                                                                                                    <Panel key={`more-${index10}`} header='more' >
                                                                                                                                                                                                                        <List itemLayout="horizontal">
                                                                                                                                                                                                                            {withoutReplies9.map((item11) =>
                                                                                                                                                                                                                              <CommentListItem item={item11} actions={[huifuButton(item11)]} />)}
                                                                                                                                                                                                                        </List>
                                                                                                                                                                                                                    </Panel>)}
                                                                                                                                                                                                              </Collapse>);})())}
                                                                                                                                                                                                  </Panel>))}
                                                                                                                                                                                                {withoutReplies8.length > 0 && (
                                                                                                                                                                                                  <Panel key={`more-${index9}`} header='more' >
                                                                                                                                                                                                      <List itemLayout="horizontal">
                                                                                                                                                                                                          {withoutReplies8.map((item10) =>
                                                                                                                                                                                                            <CommentListItem item={item10} actions={[huifuButton(item10)]} />)}
                                                                                                                                                                                                      </List>
                                                                                                                                                                                                  </Panel>)}
                                                                                                                                                                                            </Collapse>);})())}
                                                                                                                                                                                </Panel>))}
                                                                                                                                                                              {withoutReplies7.length > 0 && (
                                                                                                                                                                                <Panel key={`more-${index8}`} header='more' >
                                                                                                                                                                                    <List itemLayout="horizontal">
                                                                                                                                                                                        {withoutReplies7.map((item9) =>
                                                                                                                                                                                          <CommentListItem item={item9} actions={[huifuButton(item9)]} />)}
                                                                                                                                                                                    </List>
                                                                                                                                                                                </Panel> )}
                                                                                                                                                                          </Collapse>);})())}
                                                                                                                                                              </Panel>))}
                                                                                                                                                            {withoutReplies6.length > 0 && (
                                                                                                                                                              <Panel key={`more-${index7}`} header='more' >
                                                                                                                                                                  <List itemLayout="horizontal">
                                                                                                                                                                      {withoutReplies6.map((item8) =>
                                                                                                                                                                        <CommentListItem item={item8} actions={[huifuButton(item8)]} />)}
                                                                                                                                                                  </List>
                                                                                                                                                              </Panel> )}
                                                                                                                                                        </Collapse>);})())}
                                                                                                                                            </Panel>))}
                                                                                                                                          {withoutReplies5.length > 0 && (
                                                                                                                                            <Panel key={`more-${index6}`} header='more' >
                                                                                                                                                <List itemLayout="horizontal">
                                                                                                                                                    {withoutReplies5.map((item7) =>
                                                                                                                                                      <CommentListItem item={item7} actions={[huifuButton(item7)]} />)}
                                                                                                                                                </List>
                                                                                                                                            </Panel> )}
                                                                                                                                      </Collapse>);})())}
                                                                                                                          </Panel>))}
                                                                                                                        {withoutReplies4.length > 0 && (
                                                                                                                          <Panel key={`more-${index5}`} header='more' >
                                                                                                                              <List itemLayout="horizontal">
                                                                                                                                  {withoutReplies4.map((item6) =>
                                                                                                                                    <CommentListItem item={item6} actions={[huifuButton(item6)]} />)}
                                                                                                                              </List>
                                                                                                                          </Panel> )}
                                                                                                                    </Collapse>);})())}
                                                                                                        </Panel>))}
                                                                                                      {withoutReplies3.length > 0 && (
                                                                                                        <Panel key={`more-${index4}`} header='more' >
                                                                                                            <List itemLayout="horizontal">
                                                                                                                {withoutReplies3.map((item5) =>
                                                                                                                  <CommentListItem item={item5} actions={[huifuButton(item5)]} />)}
                                                                                                            </List>
                                                                                                        </Panel> )}
                                                                                                  </Collapse>);})())}
                                                                                      </Panel>))}
                                                                                    {withoutReplies2.length > 0 && (
                                                                                      <Panel key={`more-${index3}`} header='more' >
                                                                                          <List itemLayout="horizontal">
                                                                                              {withoutReplies2.map((item4) =>
                                                                                                <CommentListItem item={item4} actions={[huifuButton(item4)]} />)}
                                                                                          </List>
                                                                                      </Panel> )}
                                                                                </Collapse>);})())}
                                                                    </Panel>))}
                                                                  {withoutReplies1.length > 0 && (
                                                                    <Panel key={`more-${index2}`} header='more' >
                                                                        <List itemLayout="horizontal">
                                                                            {withoutReplies1.map((item3) =>
                                                                              <CommentListItem item={item3} actions={[huifuButton(item3)]} />)}
                                                                        </List>
                                                                    </Panel> )}
                                                              </Collapse>); })())}
                                                  </Panel>))}
                                                {withoutReplies.length > 0 && (
                                                  <Panel key={`more-${index}`} header='more' >
                                                      <List itemLayout="horizontal">
                                                          {withoutReplies.map((item2) =>
                                                            <CommentListItem item={item2} actions={[huifuButton(item2)]} />)}
                                                      </List>
                                                  </Panel>)}
                                            </Collapse>);})())}
                                </Panel>
                            </Collapse>
                        </div>
                      )}
                  </div>

                  <div ref={formRef}>
                      <Form form={form} onFinish={handleClick}>
                          <Form.Item name={'content'} rules={[{ required: true, message: "please input your comment." }]}>
                              <Input.TextArea placeholder={placeholder} size={"large"}></Input.TextArea>
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