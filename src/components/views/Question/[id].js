import { useState, useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment/moment";
import {
  Button,
  Card,
  Col,
  Divider,
  Image,
  message,
  
  Row,
  Dropdown,
  Menu,
  
} from "antd";
import {
  CommentOutlined,
  LikeTwoTone,
  TranslationOutlined,
  FastBackwardOutlined,
 
  DownOutlined,
  DislikeTwoTone,
} from "@ant-design/icons";

// import { CommentOutlined, LikeTwoTone } from "@ant-design/icons";
import {  evaluate } from "helpers/api/answer";
import { translate } from "helpers/api/translator";
import useAuth from "helpers/api/auth";
import styles from "styles/views/question.create.module.scss";
import Cookies from "js-cookie";
import SockJS from "sockjs-client";
import { over } from "stompjs";
const requests = axios.create({
  baseURL: "https://sopra-fs23-group-38-server.oa.r.appspot.com/", //"https://sopra-fs23-group-38-server.oa.r.appspot.com/",
  withCredentials: true,
  // baseURL: process.env.API_HOST // Change to your desired host and port
});
requests.interceptors.request.use(
  (config) => {
    config.headers["content-type"] = "multipart/form-data";
    config.headers["Access-Control-Allow-Origin"] = "*";
    config.headers["Access-Control-Allow-Headers"] =
      "Origin, X-Requested-With, Content-Type, Accept";
    config.headers["token"] = Cookies.get("token");
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);
//var stompClient = null;

// eslint-disable-next-line no-empty-pattern
const QuestionDetail = ({}) => {
  useAuth();
  const { id } = useParams();
  const router = useHistory();
  const [isTrans, setIsTrans] = useState(false);
  const [article, setArticle] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerCount, setAnswerCount] = useState(null);
  const [user] = useState({});
  const [seletedLanguage, setSeletedLanguage] = useState("en");
  const location = useLocation();
  const [originalArticle, setOriginalArticle] = useState(null);
  const [areAnswersRendered, setAreAnswersRendered] = useState(false);

  const [sortedAnswers, setSortedAnswers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [shownAnswersCount, setShownAnswersCount] = useState(5);

  useEffect(() => {

    let stompClient;

    const connectError = (err) => {
      console.log("网络异常");
      message.error("Web socket Interrupted");
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        const newSocket = new SockJS("https://sopra-fs23-group-38-server.oa.r.appspot.com/my-websocket");
        stompClient = over(newSocket);
      }, 3000);
    };

    const newSocket = new SockJS("https://sopra-fs23-group-38-server.oa.r.appspot.com/my-websocket");
    stompClient = over(newSocket);
    stompClient.connect(
      {},
      function () {
        stompClient.subscribe("/topic/getQuestionById/" + id, function (msg) {
          //let body = JSON.parse(msg.body);
          let destination = msg.headers.destination;
          let parts = destination.split("/");
          let lastNumber = parts[parts.length - 1];
          const url = window.location.href;
          const id = url.split("/").pop();
          if (lastNumber === id) {
            let body = JSON.parse(msg.body);
            setArticle(body);
            setOriginalArticle(body);
            setAnswerCount(body?.answerCount);
          }
        });

        stompClient.subscribe("/topic/getAllAnstoOneQ/" + id, function (msg) {
          let body = JSON.parse(msg.body);
          setAnswers(body);
          console.log(body);
          setAreAnswersRendered(false);
          console.log(areAnswersRendered);
        });
      },
      connectError
    );

    setStompClient(stompClient);
}, []);
 

useEffect(() => {
  if (id !== undefined && id !== "undefined" && stompClient) {
    console.log(id);
    console.log("Fetching data with websocket...");
    setTimeout(() => {
      stompClient.send(
        "/app/getQuestionById",
        {},
        JSON.stringify({ ID: id })
      );
      stompClient.send(
        "/app/getAllAnstoOneQ",
        {},
        JSON.stringify({ pageIndex: 1, questionID: id })
      );
    }, 500);
  }
}, [id, stompClient]);

  useEffect(() => {
    if (answers && answers.length > 0) {
      console.log("22222");
      setAreAnswersRendered(true); // set to true when the answers components have been rendered
    }
  }, [answers]);

  useEffect(() => {
    if (areAnswersRendered && location.hash) {
      console.log("11111");
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [areAnswersRendered, location.hash]);

  const handleEvaluate = async (id, voteValue) => {
    try {
      await evaluate({
        ID: id,
        UporDownVote: voteValue,
      }).then((response) => {
        if (response.success === "true") {
          message.info("Thumb up successfully");
          const newAnswers = answers.map((answer) => {
            if (answer.answer.id === id) {
              answer.likeCount += voteValue;
            }
            return answer;
          });
          setAnswers([...newAnswers]);
          window.location.reload();
        } else {
          message.error("Thumb up failed");
        }
      });
    } catch (error) {
      console.error("Translation error:", error);
    }
  };
  const handleLanguageChange = (menuItem) => {
    setSeletedLanguage(menuItem.key);
  };

  const handleUpvote = (id) => {
    handleEvaluate(id, 1);
    message.info("Thumb up successfully");
  };

  const handleDownvote = (id) => {
    handleEvaluate(id, -1);
    message.info("Thumb down successfully");
  };

  const toggleTrans = async () => {
    console.log(
      "123123123" + article.question.title + originalArticle.question.title
    );
    if (article.question.title !== originalArticle.question.title) {
      setArticle(originalArticle);
      console.log("after trans original article", originalArticle);
      console.log("after trans article", article);
      setIsTrans(false);
    } else {
      try {
        console.log("before original", originalArticle);
        console.log("before article", article);
        const copiedArticle = JSON.parse(JSON.stringify(article)); // Perform deep copy
        console.log("after set original article", originalArticle);
        const response1 = await translate({
          content: copiedArticle.question.title,
          targetLanguage: seletedLanguage,
        });
        const response2 = await translate({
          content: copiedArticle.question.description,
          targetLanguage: seletedLanguage,
        });

        const newArticle = { ...copiedArticle };
        newArticle.question.title = response1;
        newArticle.question.description = response2;
        setArticle(newArticle);

        setIsTrans(true);
      } catch (error) {
        console.error("Translation error:", error);
      }
    }
  };

  // const handleChange = (values) => {
  //   getSomeAnswerNew({
  //     pageIndex: values,
  //     questionID: id,
  //   }).then((response) => {
  //     if (response) {
  //       // setAnswers(response);
  //       // const url = new URL(window.location);
  //       // const anchor = url.hash.replace("#", "");
  //       // if (anchor) {
  //       //     // If there is, push the new page number and the anchor to the history
  //       //     router.push(`/question/${id}?page=${values}#${anchor}`);
  //       // } else {
  //       //     // If there is not, push the new page number only
  //       //     router.push(`/question/${id}?page=${values}`);
  //       // }
  //     }
  //   });
  // };
  const [sortByVoteCount, setSortByVoteCount] = useState(true);
  // const [sortedAnswers, setSortedAnswers] = useState([]);
  useEffect(() => {
    console.log("11111" + sortByVoteCount);
    // if (sortByVoteCount){
    console.log("有没有点赞");
    const sorted = sortByVoteCount
      ? [...answers].sort((a, b) => b.answer.vote_count - a.answer.vote_count)
      : [...answers].sort(
          (a, b) =>
            new Date(b.answer.change_time) - new Date(a.answer.change_time)
        );
    // setAnswers(sorted)
    setSortedAnswers(sorted);
  }, [sortByVoteCount, answers]);

  const handleSortByVoteCount = () => {
    setSortByVoteCount(!sortByVoteCount);
  };

  //const {Option} = Select;

  const TransMenu = (
    <Menu onClick={handleLanguageChange}>
      <Menu.Item key="en">English</Menu.Item>
      <Menu.Item key="fr">French</Menu.Item>
      <Menu.Item key="es">Spanish</Menu.Item>
      <Menu.Item key="de">German</Menu.Item>
      <Menu.Item key="zh">Chinese</Menu.Item>
    </Menu>
  );

  // const menu = (
  //   <Menu onClick={handleSortByVoteCount}>
  //     <Menu.Item key="1">vote count</Menu.Item>
  //     <Menu.Item key="2">chronic order</Menu.Item>
  //   </Menu>
  // );

  const languageLabels = {
    en: "English",
    fr: "French",
    es: "Spanish",
    de: "German",
    zh: "Chinese",
  };
  useEffect(() =>{
        if (!article.name){
            window.location.reload();
        }
    },[article]);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {article && (
          <Card
            style={{ width: 765 }}
            cover={
              <img
                style={{
                  height: "256px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                alt="example"
                src="https://cdn.pixabay.com/photo/2020/04/19/08/17/watercolor-5062356_960_720.jpg"
              />
            }
          >
            <Row>
              <Col span={3}>
                <Image
                  preview={false}
                  width={64}
                  height={64}
                  src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${article.user_avatar}&scale=90`}//这里变动了

                />
              </Col>
              <Col span={13}>
                {/*<p className={styles.name}>{article.username}</p>*/}
                {user && user.username === article.username ? (
                  <div>
                    <p
                      className={styles.name}
                      style={{ fontSize: "18px", marginTop: "4px" }}
                    >
                      {article.username}
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      router.push(`/center/${`U${article.userId * 3}`}`)
                    }
                    className={styles.username}
                  >
                    <p
                      className={styles.name}
                      style={{ fontSize: "18px", marginTop: "4px" }}
                    >
                      {article.username}
                    </p>
                  </div>
                )}
                <p className={styles.date}>
                  {moment(article.question.change_time).format("ll")}
                </p>
              </Col>
              <Col>
                <Dropdown.Button
                  onClick={(e) => e.preventDefault()}
                  overlay={TransMenu}
                  icon={<DownOutlined />}
                >
                  Translate to {languageLabels[seletedLanguage]}
                </Dropdown.Button>
              </Col>
              <Col>
                <Button
                  style={{ backgroundColor: isTrans ? "#537494" : "#3B7AF5" }}
                  onClick={toggleTrans}
                  type="primary"
                  icon={<TranslationOutlined />}
                ></Button>
              </Col>

              <Col>
                <Button
                  style={{ marginLeft: "8px" }}
                  onClick={() => router.push("/index/1")}
                >
                  <FastBackwardOutlined />
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={18}>
                <span className={styles.title}>{article.question.title}</span>
              </Col>
              <Col span={6}>
                <Button
                  onClick={() => router.push(`/question/${id}/answer`)}
                  style={{ backgroundColor: "#6F3BF5", marginTop: "16px" }}
                  type={"primary"}
                >
                  Answer this Question
                </Button>
              </Col>
            </Row>
            <Row>
              <p className={styles.description}>
                {article.question.description}
              </p>
            </Row>

            <p style={{ fontWeight: 600, fontSize: "16px" }}></p>

            <button onClick={handleSortByVoteCount}>
              {sortByVoteCount
                ? "Sort by chronological order"
                : "Sort by vote count"}
            </button>

            <p style={{ fontWeight: 600, fontSize: "16px" }}>
              {answerCount} Answers
            </p>
            {sortedAnswers.slice(0, shownAnswersCount).map((answer) => {
              return (
                <div id={answer.answer.id} key={answer.answer.id}>
                  <Row>
                    <Col span={3} style={{ textAlign: 'center' }}>
                      <Image
                        preview={false}
                        width={64}
                        height={64}
                        src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${answer.who_answers_avatar}&scale=90`}//这里变动了
                      />

                      {user && user.username === answer.who_answers_name ? (
                        <div>
                          <p
                            className={styles.name}
                            style={{ fontSize: "16px", marginTop: "4px" }}
                          >
                            {answer.who_answers_name}
                          </p>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            router.push(
                              `/center/${`U${answer.who_answersId * 3}`}`
                            )
                          }
                          className={styles.username}
                        >
                          <p
                            className={styles.name}
                            style={{ fontSize: "14px", marginTop: "4px" }}
                          >
                            {answer.who_answers_name}
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={18}>
                      <div
                        onClick={() => {
                          router.push(`/question/answer/${answer.answer.id}`);
                        }}
                        className={styles.comment}
                      >
                        <p style={{ marginTop: "0px", wordWrap: "break-word", whiteSpace: "normal" }}>
                          {answer.answer.content}
                        </p>
                        <p>
                          <CommentOutlined />
                          <span
                            className={styles.date}
                            style={{ marginLeft: "4px" }}
                          >
                            {answer.answer.comment_count} comments
                          </span>
                          <span
                            className={styles.date}
                            style={{ float: "right" }}
                          >
                            Posted on{" "}
                            {moment(answer.answer.change_time).format("ll")}
                          </span>
                        </p>
                      </div>
                    </Col>

                    <Col style={{ display: 'flex', justifyContent: 'space-between'}}>
                      <div
                        className={styles.hover}
                        onClick={() => handleUpvote(answer.answer.id)}
                      >
                        <LikeTwoTone />
                        <span
                          style={{ marginLeft: "4px",fontWeight:"bold",fontSize: "5px",color: "purple" }}
                          className={styles.date}
                        >
                          {answer.answer.vote_count} likes
                        </span>
                      </div>
                      <div
                        className={styles.hover}
                        onClick={() => handleDownvote(answer.answer.id)}
                        style={{ position: 'relative', left: '5px', top: '1px' }}
                      >
                        <DislikeTwoTone />
                        {/* <span style={{ marginLeft: '4px' }} className={styles.date}>{answer.answer.vote_count} dislikes</span> */}
                      </div>
                    </Col>
                  </Row>

                  <Divider />
                </div>
              );
            })}
            {shownAnswersCount < sortedAnswers.length && (
                    <button onClick={() => setShownAnswersCount(shownAnswersCount + 5)}>
                      Show more
                    </button>
                  )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
