import { useState, useEffect } from "react";
import { Button, message, Pagination } from "antd";
import { TranslationOutlined} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import Content from "components/ui/Content";
import { getTotalPageCount, listQuestions } from "helpers/api/question.js";
import styles from "styles/views/home.module.scss";

const Index = Home => {
    const history = useHistory();
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState({});

    const handleClick = () => {
        history.push("/question/create");
    };

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

                <div>
                    {items &&
                        items.map((item) => {
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
                                            bio: "",
                                            email: "",
                                        }}
                                    />
                                </div>
                            );
                        })}
                    <Pagination
                        onChange={(page) => setPage(page)}
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