import { useState, useEffect } from "react";
import {Button, Menu, message, Pagination, Dropdown} from "antd";
import { SortAscendingOutlined} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import Content from "components/ui/Content";
import { getTotalPageCount, listQuestions } from "helpers/api/question.js";
import styles from "styles/views/home.module.scss";
import SockJS from "sockjs-client";
import { over } from "stompjs";
var stompClient = null;
const Index = Home => {
    const history = useHistory();
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState({});
    const [socket, setSocket] = useState(null);
    const handleClick = () => {
        history.push("/question/create");
    };
    const handlePageChange = (page) => {
        // 导航到当前页面，触发页面的重新加载
        setPage(page)
        history.push(`/index/${page}`);
    };


    useEffect(() => {
        if (localStorage.getItem("user")) {
            setUser(JSON.parse(localStorage.getItem("user")));
        }
        const url = window.location.href;
        const id = url.split('/').pop();
        setPage(id)

        var newSocket = new SockJS("http://localhost:8080/my-websocket");
        stompClient = over(newSocket);

        stompClient.connect({}, function() {
            stompClient.subscribe("/topic/howManyQuestions/", function(msg) {
                let body = JSON.parse(msg.body)
                const url = window.location.href;
                const id = url.split('/').pop();
                setPage(id)
                if (id>body.howmanypages){

                    handlePageChange(1)
                    setPage(id)
                }
                setTotal(body.howmanypages);
                console.log(body)
            });
            subscribeToQuestions();
        }, connectError);
        const subscribeToQuestions = () => {
            const topic = `/topic/listQuestions/${page}`;
            stompClient.subscribe(topic, function(msg) {
                let destination = msg.headers.destination;
                let parts = destination.split("/");
                let lastNumber = parts[parts.length - 1];
                const url = window.location.href;
                const id = url.split('/').pop();
                if (lastNumber===id){
                    let body = JSON.parse(msg.body);
                    setItems(body);
                }

            });
        };
        const connectError = (err) => {
            console.log("网络异常")
            message.error("Web socket Interrupted");
            setTimeout(() => {
                console.log("Attempting to reconnect...");
                setSocket(null);
                const newSocket = new SockJS("http://localhost:8080/my-websocket");
                stompClient = over(newSocket);
                setSocket(stompClient);
            }, 3000);
        };
        socket && socket.disconnect(() => {
            console.log('WebSocket disconnected!');
            connectError();
        });
        setTimeout(() => {
            stompClient.send("/app/getHowManyQuestions/", {});
            stompClient.send("/app/getAllQuestions/" + page.toString(), {});

        }, 1000);

        return () => {
            socket && socket.disconnect();
            setSocket(null);
        };
    },[page,socket]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            stompClient.send("/app/getHowManyQuestions/", {});
            stompClient.send("/app/getAllQuestions/" + page, {});
        }, 100);
        return () => clearTimeout(timeout);
    }, [page, socket]);


    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user")));
        console.log(user)
        getTotalPageCount().then((response) => {
            if (response.success === "false") {
                message.error(response.reason);
            } else {
                setTotal(response.howmanypages);
            }
        });

        listQuestions({
            pageIndex: page,
        }).then((response) => {
            console.log(response);
            if (response.success && response.success === "false") {
                message.error(response.reason);
            } else {
                setItems(response);
            }
        });
    }, [page]);
    // Sort by answer count
    const [sortByAnswerCount, setSortByAnswerCount] = useState(false);
    useEffect(() => {
        // fetch answer_count from backend
        listQuestions({
            pageIndex: page,
        }).then((response) => {
            console.log(response);
            if (response.success && response.success === "false") {
                message.error(response.reason);
            } else {
                const sortedItems = sortByAnswerCount
                  ? [...response].sort(
                    (a, b) => b.question.answer_count - a.question.answer_count
                  )
                  : [...response].sort(
                    (a, b) =>
                      new Date(b.question.change_time) -
                      new Date(a.question.change_time)
                  );
                setItems(sortedItems);
            }
        });
    }, [page, sortByAnswerCount]);
    const handleSortByAnswerCount = () => {
        setSortByAnswerCount(!sortByAnswerCount);
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
                    <p className={styles.welcome}>Ask your Question Now!</p>
                    <p className={styles.desc}>
                        Increase your knowledge by reading new things and I will
                    </p>
                    <p className={styles.desc}>
                        share whatever I know for you, as long as I enjoy it
                    </p>
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
                <div>
                    {items &&
                        items.map((item) => {
                            return (
                                <div key={item.question.id}>
                                    <Content
                                        article={{
                                            id: item.question.id,
                                            userid: item.question.who_asks,
                                            headImg: `https://bing.ioliu.cn/v1?d=${item.question.who_asks}&w=32&h=32`,
                                            title: item.question.title,
                                            name: item.who_asks_name,
                                            createTime: item.question.change_time,
                                            cover: "error",
                                            description: item.question.description,
                                            likeCount: item.likeCount,
                                            bio: "",
                                            email: "",
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
}
export default Index;