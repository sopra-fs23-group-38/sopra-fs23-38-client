import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { search } from "helpers/api/search";
import styles from "styles/views/search.module.scss";
const { Option } = Select;

const Search = () => {
    const [items, setItems] = useState([]);
    const [setSearchType] = useState('All');
    const history = useHistory();

    const onFinish = (values) => {
        search(values).then((response) => {
            setItems(response);
        });
    };

    const handleSearchTypeChange = (searchType) => {
        setSearchType(searchType);
    };

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <p className={styles.welcome}>Search Your Interests!</p>

                <Form onFinish={onFinish} className={styles.form}>
                    <Row>
                        <Col span={22}>
                            <Form.Item
                                name="keyword"
                                rules={[{ required: true, message: "please input your keywords." }]}
                            >

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Select
                                        defaultValue="All"
                                        style={{ marginRight: "8px", width: "120px" }}
                                        size={"large"}
                                        onChange={handleSearchTypeChange}
                                    >
                                        <Option value="All">All</Option>
                                        <Option value="User">User</Option>
                                        <Option value="Question">Question</Option>
                                        <Option value="Answer">Answer</Option>
                                    </Select>
                                    <Input
                                        style={{ width: "756px", height: "48px" }}
                                        size={"large"}
                                        placeholder={"Type the keywords here"}
                                        suffix={
                                            <Button
                                              icon={<SearchOutlined />}
                                              type={"text"}
                                              size={"large"}
                                              htmlType="submit"
                                            />
                                        }
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button
                        htmlType={"submit"}
                        style={{
                            marginTop: "32px",
                            width: "128px",
                            height: "48px",
                            backgroundColor: "#6F3BF5",
                            color: "#FFFFFF", // Add this line to change the button text color
                            fontWeight: "bold", // Add this line to make the button text bold
                            fontFamily: "Roboto, sans-serif",
                        }}
                        type={"primary"}
                        shape={"round"}
                        size={"large"}
                        className={styles.searchButton} // Add this line to apply a custom CSS class
                    >
                        Search
                    </Button>

                    {/* eslint-disable-next-line array-callback-return */}
          {items.map((item) => {
            if (item.description !== "用户" && item.description !== "文章") {
              return (
                <div key={item.html_url} className={styles.content}>
                  <Card
                    style={{ width: "756px", padding: 0 }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <span
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "500px",
                        }}
                        onClick={() => {
                            history.push(item.html_url);
                        }}
                        className={styles.title}
                    >
                      {item.name}
                    </span>

                                        <span style={{ float: "right", marginTop: "8px" }}>
                      {item.type}
                    </span>
                                    </Card>
                                </div>
                            );
                        }
                    })}
                </Form>
            </div>
        </div>
    );
};

export default Search;
