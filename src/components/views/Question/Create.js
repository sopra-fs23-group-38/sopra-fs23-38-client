import React from "react";
import { Button, Card, Form, Input } from "antd";
import styles from "../styles/question.create.module.scss";
import { newQuestion } from "helpers/api/question";
import useAuth from "helpers/api/auth_util";

const Create = () => {
    useAuth();

    const handleCreate = (values) => {
        if (!values.detail) {
            values["detail"] = "";
        }

        newQuestion(values).then((response) => {
            if (response.success === true) {
                console.log("创建成功");
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
