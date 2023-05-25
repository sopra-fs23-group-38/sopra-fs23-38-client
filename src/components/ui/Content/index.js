import styles from "./content.module.scss";
import { Card, Col, Image, Row } from "antd";
import moment from "moment";
import Cookies from 'js-cookie';
//import {translate} from "helpers/api/translator";
const Content = ({ article }) => {
    console.log(article);

    return (
        <div className={styles.content}>
            <Card style={{ width: "756px", padding: 0 }} bodyStyle={{ padding: "16px" }}>
                <p className={styles.tag}>{article.tag}</p >
                <Row>
                    <Col span={18} style={{ display: "flex", alignItems: "center" }}>
                        <span
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "512px",
                            }}
                            onClick={() => {
                                window.location.href = `/question/${article.id}`;
                            }}
                            className={styles.title}
                        >
                            {article.title}
                        </span>

                    </Col>
                    <Col span={3}>
                        <Image
                            preview={false}
                            width={64}
                            height={64}
                            src={`https://api.dicebear.com/6.x/adventurer/svg?seed=${article.avatar}&scale=90`} // Use ` to interpolate
                        />
                    </Col>


                    <Col span={3}>
                        <span
                            onClick={() => {
                                if (!Cookies.get("token")) {
                                    window.location.href = '/login';
                                } else {
                                    window.location.href = `/center/${`U${article.nameid * 3}`}`;
                                }
                            }}
                            className={styles.name}>{article.name}</span>

                        <p className={styles.date}>
                            {moment(article.createTime).format("ll")}
                        </p>
                    </Col>
                </Row>
                </Row>
            </Card>
        </div>
    );
};

export default Content;
