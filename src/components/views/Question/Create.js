import React from "react";
import { Button, Card, Form, Input } from "antd";
import styles from "styles/views/question.create.module.scss";
import { newQuestion } from "helpers/api/question";
import useAuth from "helpers/api/auth";
import { Select } from "antd";

const Create = () => {
    useAuth();

    const handleCreate = (values) => {
        if (!values.detail) {
            values["detail"] = "";
        }

        newQuestion(values).then((response) => {
            // console.log(response)
            if (response.success === 'true') {
                // console.log("创建成功");
                window.location.replace(response.userID);
            }
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <p className={styles.title}>Create Your Own Question</p>
                <Card bordered style={{ width: "560px" }}>
                    <Form onFinish={handleCreate}>
                        <Form.Item
                            name={"title"}
                            rules={[{ required: true, message: "please input question title." }]}
                        >
                            <Input size={"large"} placeholder={"Your Question Title"} />
                        </Form.Item>

                        <Form.Item name={"detail"}>
                            <Input.TextArea
                                size={"large"}
                                placeholder={"Description (optional)"}
                            />
                        </Form.Item>

                        <Form.Item name="tag" rules={[{ required: true, message: "Please select a tag for your question." }]}>
                            <Select
                                className={styles.selectTag}
                                size="large"
                                placeholder="Select a tag"
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="study">Study</Select.Option>
                                <Select.Option value="sports">Sports</Select.Option>
                                <Select.Option value="life">Life</Select.Option>
                                <Select.Option value="other">Other</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                style={{ backgroundColor: "#6F3BF5" }}
                                size={"large"}
                                type={"primary"}
                                htmlType={"submit"}
                            >
                                Create
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default Create;
