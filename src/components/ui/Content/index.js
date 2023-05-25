import styles from "./content.module.scss";
import { Card, Col, Image, Row } from "antd";
import moment from "moment";
import Cookies from 'js-cookie';
//import {translate} from "helpers/api/translator";

const getTagColor = (tag) => {
    switch (tag) {
      case 'study':
        return 'red';  // Replace 'red' with the actual color code you want
      case 'life':
        return 'blue';  // Replace 'blue' with the actual color code you want
      case 'sports':
        return 'darkgreen';  // Replace 'yellow' with the actual color code you want
      default:
        return 'orange';  // Replace 'black' with the actual color code you want
    }
  };

const Content = ({ article }) => {
    console.log(article);

    return (
        <div className={styles.content}>
            <Card className={styles.card} style={{ width: "770px", padding: 0 }} bodyStyle={{ padding: "12px" }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center' // This aligns the tag and count vertically in the middle
                    }}>
                    <p
                        className={styles.tag}
                        style={{
                            color: getTagColor(article.tag),
                            fontSize: '17px',
                            marginRight: '30px' // Add some right margin to separate tag and count
                        }}>{article.tag}</p>
                    <p
                        className={styles.count}
                        style={{
                            fontSize: '17px',
                            fontWeight: 'bold'
                        }}>🔥: {article.count}</p>
                </div>

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
            </Card>
        </div>
    );
};

export default Content;
