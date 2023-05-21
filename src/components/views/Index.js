import React, { useState, useEffect, useRef } from "react";
import {Button, Menu, message, Pagination, Dropdown,Select} from "antd";
import { SortAscendingOutlined} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import Content from "components/ui/Content";
import styles from "styles/views/home.module.scss";
import SockJS from "sockjs-client";
import { over } from "stompjs";
var newStompClient = null;
// var selectedTag = "";
const Index = () => {

    const history = useHistory();
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState({});
    const [socket, setSocket] = useState(null);
    const [socketUpdated, setSocketUpdated] = useState(false);
    const [selectedTag, setSelectedTag] = useState("");
    // Sort by answer count
    const [sortByAnswerCount, setSortByAnswerCount] = useState(false);
    const { Option } = Select;
    const tags = ["Study", "Life", "Sports", "Other"];
    const [webSocketConnected,setWebSocketConnected] =useState(false)
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [subscriptionhowmanyId, setSubscriptionhowmanyId] = useState(null);
    const handleClick = () => {
        history.push("/question/create");
    };
    const handlePageChange = (page) => {
        // 导航到当前页面，触发页面的重新加载
        setPage(page)
        history.push(`/index/${page}`);
        // newStompClient.disconnect()
    };
    const connectError = (err) => {
        message.error("Web socket Interrupted");
        setTimeout(() => {
            console.log("Attempting to reconnect...");
            setSocket(null);
            const newSocket = new SockJS("http://localhost:8080/my-websocket");
            newStompClient = over(newSocket);
            setSocket(newStompClient);
        }, 3000);
    };


    useEffect(() => {
        let isUnmounted = false;
        // eslint-disable-next-line react-hooks/rules-of-hooks



        const connectToWebSocket = () => {
            const newSocket = new SockJS("http://localhost:8080/my-websocket");
            newStompClient = over(newSocket);

            // setSocket(newStompClient);
            // stompClientRef.current=newStompClient;
            // setSocket(newStompClient)
            newStompClient.connect({}, function() {
                if (isUnmounted) return;
                console.log("11111111")
                setWebSocketConnected(true);
                // setSocket(newStompClient);
                subscribeToHowManyQuestions();
                subscribeToListQuestions();


            }, connectError);


        };


        const subscribeToHowManyQuestions = () => {
            if(selectedTag === ""){
                const subhowmany = newStompClient.subscribe("/topic/howManyQuestions/", function(msg) {
                    let body = JSON.parse(msg.body);
                    const url = window.location.href;
                    const id = url.split('/').pop();
                    setPage(id);
                    if (id > body.howmanypages) {
                        handlePageChange(1);
                        setPage(id);
                    }
                    setTotal(body.howmanypages);
                    console.log(body);
                }
                );
                setSubscriptionhowmanyId(subhowmany.id);
            } else {
                const subhowmany = newStompClient.subscribe(
                    `/topic/howManyQuestions/${selectedTag}/`,
                    function (msg) {
                        let body = JSON.parse(msg.body);
                        const url = window.location.href;
                        const id = url.split("/").pop();
                        setPage(id);
                        if (id > body.howmanypages) {
                            handlePageChange(1);
                            setPage(id);
                        }
                        setTotal(body);
                        // console.log(body);
                    }
                );
                setSubscriptionhowmanyId(subhowmany.id);
            }
    };

    const subscribeToListQuestions = () => {
      if (sortByAnswerCount === 0) {
        if (selectedTag !== "") {
          const topic = `/topic/listQuestions/${page}/${selectedTag}/`;
          const sub = newStompClient.subscribe(topic, function (msg) {
            // if(selectedTag===""){
            console.log(selectedTag + "selectedTag");
            let destination = msg.headers.destination;
            let parts = destination.split("/");
            let lastNumber = parts[parts.length - 3];
            console.log(lastNumber);
            const url = window.location.href;
            const id = url.split("/").pop();
            if (lastNumber === id) {
              let body = JSON.parse(msg.body);
              setItems(body);
            }
          });
          setSubscriptionId(sub.id);
        } else {
          const topic = `/topic/listQuestions/${page}/`;
          const sub = newStompClient.subscribe(topic, function (msg) {
            if (selectedTag === "") {
              console.log(selectedTag + "selectedTag");
              let destination = msg.headers.destination;
              let parts = destination.split("/");
              let lastNumber = parts[parts.length - 2];
              const url = window.location.href;
              const id = url.split("/").pop();
              if (lastNumber === id) {
                let body = JSON.parse(msg.body);
                setItems(body);
              }
            }
          });
          setSubscriptionId(sub.id);
        }
      } else {
        if (selectedTag !== "") {
          const topic = `/topic/listQuestions/${page}/${selectedTag}/1/`;
          const sub = newStompClient.subscribe(topic, function (msg) {
            // if(selectedTag===""){
            console.log(selectedTag + "selectedTag");
            let destination = msg.headers.destination;
            let parts = destination.split("/");
            let lastNumber = parts[parts.length - 3];
            console.log(lastNumber);
            const url = window.location.href;
            const id = url.split("/").pop();
            if (lastNumber === id) {
              let body = JSON.parse(msg.body);
              setItems(body);
              // }
            }
          });
          setSubscriptionId(sub.id);
        } else {
          const topic = `/topic/listQuestions/${page}/1/`;
          const sub = newStompClient.subscribe(topic, function (msg) {
            if (selectedTag === "") {
              console.log(selectedTag + "selectedTag");
              let destination = msg.headers.destination;
              let parts = destination.split("/");
              let lastNumber = parts[parts.length - 3];
              console.log(lastNumber);
              const url = window.location.href;
              const id = url.split("/").pop();
              if (lastNumber === id) {
                let body = JSON.parse(msg.body);
                setItems(body);
                // }
              }
            }
          });
          setSubscriptionId(sub.id);
        }
      }
    };


    // setSocket(newStompClient);
    // console.log(socket);
    connectToWebSocket();

    return () => {
      isUnmounted = true;
      if (newStompClient) {
        // newStompClient && newStompClient.disconnect();
        newStompClient.disconnect();
      }
      if (subscriptionId) {
        newStompClient.unsubscribe(subscriptionId);
        newStompClient.unsubscribe(subscriptionhowmanyId);
      }
    };
  }, [page]);

  useEffect(() => {
    if (selectedTag !== "" && sortByAnswerCount === 0) {
      const topictag = `/topic/listQuestions/${page}/${selectedTag}/`;
      console.log(page);
      if (newStompClient && newStompClient.connected && webSocketConnected) {
        // 确保WebSocket连接已建立
        newStompClient.unsubscribe(subscriptionId);
        newStompClient.unsubscribe(subscriptionhowmanyId);

        const subscription = newStompClient.subscribe(topictag, function (msg) {
          let destination = msg.headers.destination;
          let parts = destination.split("/");
          let lastNumber = parts[parts.length - 3];
          const url = window.location.href;
          const id = url.split("/").pop();
          console.log(lastNumber);
          if (lastNumber === id) {
            let body = JSON.parse(msg.body);

            setItems(body);

            // console.log(Math.ceil(sortedItems.length / 7));
            if (body.length === 0) {
              setPage(1);
              setTotal(1);
            } else {
              setPage(Math.ceil(body.length / 7));
              setTotal(Math.ceil(body.length / 7));
            }
          }
        });
        const subhowmanytag = newStompClient.subscribe(
          `/topic/howManyQuestions/${selectedTag}/`,
          function (msg) {
            let body = JSON.parse(msg.body);
            const url = window.location.href;
            const id = url.split("/").pop();
            setPage(id);
            if (id > body) {
              handlePageChange(1);
              setPage(id);
            }
            setTotal(body);

            console.log(body);
          }
        );

        return () => {
          subscription.unsubscribe();
          subhowmanytag.unsubscribe();
        };
      }
    }
    if (sortByAnswerCount === 1) {
      const topictag = `/topic/listQuestions/${page}/${selectedTag}/1/`;
      console.log(page);
      if (newStompClient && newStompClient.connected && webSocketConnected) {
        // 确保WebSocket连接已建立
        newStompClient.unsubscribe(subscriptionId);
        newStompClient.unsubscribe(subscriptionhowmanyId);

        const subscription = newStompClient.subscribe(topictag, function (msg) {
          let destination = msg.headers.destination;
          let parts = destination.split("/");
          let lastNumber = parts[parts.length - 4];
          const url = window.location.href;
          const id = url.split("/").pop();
          console.log(lastNumber);
          if (lastNumber === id) {
            let body = JSON.parse(msg.body);

            setItems(body);

            // console.log(Math.ceil(sortedItems.length / 7));
            if (body.length === 0) {
              setPage(1);
              setTotal(1);
            } else {
              setPage(Math.ceil(body.length / 7));
              setTotal(Math.ceil(body.length / 7));
            }
          }
        });
        const subhowmanytag = newStompClient.subscribe(
          `/topic/howManyQuestions/${selectedTag}/`,
          function (msg) {
            let body = JSON.parse(msg.body);
            const url = window.location.href;
            const id = url.split("/").pop();
            setPage(id);
            if (id > body) {
              handlePageChange(1);
              setPage(id);
            }
            setTotal(body);

            console.log(body);
          }
        );
        return () => {
          subscription.unsubscribe();
          subhowmanytag.unsubscribe();
        };
      }
    }
  }, [page, selectedTag, socket, webSocketConnected]);

  useEffect(() => {
    if (sortByAnswerCount === 1 && selectedTag === "") {
      const topictag = `/topic/listQuestions/${page}/1/`;
      console.log(page);
      if (newStompClient && newStompClient.connected && webSocketConnected) {
        // 确保WebSocket连接已建立
        newStompClient.unsubscribe(subscriptionId);
        // newStompClient.unsubscribe(subscriptionhowmanyId);

        const subscriptionsort = newStompClient.subscribe(
          topictag,
          function (msg) {
            let destination = msg.headers.destination;
            let parts = destination.split("/");
            let lastNumber = parts[parts.length - 3];
            const url = window.location.href;
            const id = url.split("/").pop();
            console.log(lastNumber);
            if (lastNumber === id) {
              let body = JSON.parse(msg.body);

              setItems(body);

              // console.log(Math.ceil(sortedItems.length / 7));
              // if (body.length === 0) {
              //     setPage(1);
              //     setTotal(1);
              // } else {
              //     setPage(Math.ceil(body.length / 7));
              //     setTotal(Math.ceil(body.length / 7));
              // }
            }
          }
        );
        return () => {
          subscriptionsort.unsubscribe();
        };
      }
    }
    if (sortByAnswerCount === 1 && selectedTag !== "") {
      const topictag = `/topic/listQuestions/${page}/${selectedTag}/1/`;
      console.log(page);
      if (newStompClient && newStompClient.connected && webSocketConnected) {
        // 确保WebSocket连接已建立
        newStompClient.unsubscribe(subscriptionId);
        newStompClient.unsubscribe(subscriptionhowmanyId);

        const subscription = newStompClient.subscribe(topictag, function (msg) {
          let destination = msg.headers.destination;
          let parts = destination.split("/");
          let lastNumber = parts[parts.length - 4];
          const url = window.location.href;
          const id = url.split("/").pop();
          console.log(lastNumber);
          if (lastNumber === id) {
            let body = JSON.parse(msg.body);

            setItems(body);

            // console.log(Math.ceil(sortedItems.length / 7));
            if (body.length === 0) {
              setPage(1);
              setTotal(1);
            } else {
              setPage(Math.ceil(body.length / 7));
              setTotal(Math.ceil(body.length / 7));
            }
          }
        });
        const subhowmanytag = newStompClient.subscribe(
          `/topic/howManyQuestions/${selectedTag}/`,
          function (msg) {
            let body = JSON.parse(msg.body);
            const url = window.location.href;
            const id = url.split("/").pop();
            setPage(id);
            if (id > body) {
              handlePageChange(1);
              setPage(id);
            }
            setTotal(body);

            console.log(body);
          }
        );
        return () => {
          subscription.unsubscribe();
          subhowmanytag.unsubscribe();
        };
      }
    }
  }, [page, sortByAnswerCount, socket, webSocketConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedTag === "all") {
        window.location.reload();
      }
      console.log("00000" + selectedTag + page);
      if (newStompClient !== null) {
        if (sortByAnswerCount === 0) {
          newStompClient.send("/app/getHowManyQuestions/", {});
          newStompClient.send(
            "/app/getAllQuestions/" + page.toString() + "/" + selectedTag,
            {}
          );
        } else {
          if (selectedTag) {
            // newStompClient.send("/app/getHowManyQuestions/"+selectedTag, {});
            newStompClient.send(
              "/app/getAllQuestions/" +
                page.toString() +
                "/" +
                selectedTag +
                "/" +
                sortByAnswerCount,
              {}
            );
          } else {
            newStompClient.send(
              "/app/getAllQuestions/" + page.toString() + "/" + 1,
              {}
            );
          }
        }
      }
    }, 1000);

    // 清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [selectedTag, page, sortByAnswerCount]);

  const handleSortByAnswerCount = () => {
    if (sortByAnswerCount === 0) {
      setSortByAnswerCount(1);
      message.info("Sort by answer count");
    } else {
      window.location.reload();
      message.info("Sort by time");
    }
    // const sortedItems = sortByAnswerCount
    //   ? [...items].sort((a, b) => b.question.answer_count - a.question.answer_count)
    //   : [...items].sort((a, b) => new Date(b.question.change_time) - new Date(a.question.change_time));
    // setItems(sortedItems)
    // console.log(sortedItems);
  };
  //select question from tags:
  const handleFilterByTag = (value) => {
    console.log(value);
    setSelectedTag(value);
    // selectedTag = `"${value}"`;
  };


    const menu = (
        <Menu onClick={handleSortByAnswerCount}>
            <Menu.Item key="1">Time</Menu.Item>
            <Menu.Item key="2">Answer count</Menu.Item>
        </Menu>
    );
    return (
      <div className={styles.container}>
          <main className={styles.main}>
              <div className={styles.information}>
                  <p className={styles.welcome}>Ask your Question Now!</p >
                  <p className={styles.desc}>
                      Increase your knowledge by reading new things and I will
                  </p >
                  <p className={styles.desc}>
                      share whatever I know for you, as long as I enjoy it
                  </p >
              </div>

                <Button
                    style={{ backgroundColor: "#6F3BF5" }}
                    onClick={handleClick}
                    type={"primary"}
                    size={"large"}
                >
                    Create Question
                </Button>
                <Dropdown overlay={menu}>
                <Button
                  onClick={handleSortByAnswerCount}
                  type={"primary"}
                  size={"small"}
                  style={{ margin: "16px 0" }}
                >
                    Sort by
                    <SortAscendingOutlined style={{ marginLeft: '8px' }} />
                </Button>
                </Dropdown>
                <Select
                  style={{ marginLeft: "16px" }}
                  placeholder="Select a tag"
                  onChange={handleFilterByTag}
                  allowClear
                >
                    <Option key="all" value="all">
                        All
                    </Option>
                    {tags.map((tag) => (
                      <Option key={tag} value={tag}>
                          {tag}
                      </Option>
                    ))}
                </Select>
                <div>
                    {items &&
                      items
                        .sort((a, b) => b.likeCount - a.likeCount)
                        .map((item) => {
                            return (
                                <div key={item.question.id}>
                                    <Content
                                        article={{
                                            id: item.question.id,
                                            headImg: "error",
                                            title: item.question.title,
                                            name: item.who_asks_name,
                                            createTime: item.question.change_time,
                                            cover: "error",
                                            description: item.question.description,
                                            likeCount: item.likeCount,
                                            email: "",
                                            tag: item.question.tag,
                                            nameid: item.who_asksId,
                                            avatar:item.who_asks_avatar
                                        }}
                                    />
                                </div>
                            );
                        })}
                    <Pagination
                        onChange={(page) => handlePageChange(page)}
                        style={{ marginTop: "24px", textAlign: "center" }}
                        defaultPageSize={3}
                        defaultCurrent={1}
                        total={total * 3}
                    ></Pagination>
                </div>
            </main>
        </div>
    );
};
export default Index;