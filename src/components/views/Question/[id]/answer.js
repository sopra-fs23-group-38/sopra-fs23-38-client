import styles from "styles/views/question.create.module.scss";
import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { getQuestion } from "helpers/api/question";
import useAuth from "helpers/api/auth";
import axios from "axios";
import {useHistory,useParams} from "react-router-dom";
import Cookies from "js-cookie";
const requests = axios.create({
    baseURL: "http://localhost:8080",//"https://sopra-fs23-group-38-server.oa.r.appspot.com/",
    withCredentials: true, // Change to your desired host and port
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
export const getServerSideProps = async (context) => {
    const { params } = context
    const { id } = params
    if (typeof id !== 'undefined' && id !== 'undefined') {
        const response = await requests.get("/question/getQuestion", {
            params: {
                questionId: id
            }
        })
        const question = response.data

        return {
            props: {
                question,
            }
        }
    } else {
        return {
            props: {
            }
        }
    }
}
const Answer = ({ question }) => {
    useAuth()
    const router = useHistory()
    // const location = useParams();
    // const searchParams = new URLSearchParams(location.search);
    const { id } = useParams();
    const [article, setArticle] = useState(question);

    useEffect(() => {
        getQuestion({
            ID: id
        }).then((response) => {
            setArticle(response)
        })
    }, [])
    console.log(article)
    const onFinish = (values) => {
        values['which_question'] = id
        // eslint-disable-next-line no-unused-vars
        const response = requests.post(`/answer/createAnswer?questionID=${id}&content=${values['content']}`).then(
            (
                response =>{
                    console.log(response.status)
                    if (response.status === 200) {
                        message.info('Answer created!')
                        router.push(`/question/${id}`)
                    }
                }
            )
        )



    }

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                {article &&  <Card
                    style={{ width: 765 }}
                    cover={<img style={{ height: '256px', objectFit: 'cover', objectPosition: 'center' }} alt="example" src="https://cdn.pixabay.com/photo/2020/04/19/08/17/watercolor-5062356_960_720.jpg" />}
                >

                    <p className={styles.title} style={{ marginTop: '0px' }}>{article.question.title}</p>
                    <p className={styles.description} style={{ marginTop: '0px' }}>{ article.question.description }</p>

                    <Form onFinish={onFinish}>
                        <Form.Item name={'content'} style={{ marginTop: '24px' }} rules={[{ required: true, message: "please input your answer." }]}>
                            <Input.TextArea size={"large"} placeholder={"Type your answer here."}/>
                        </Form.Item>

                        <Form.Item>
                            <Button  htmlType={"submit"} style={{ backgroundColor: '#6F3BF5' }} size={"large"} type={"primary"}>Answer</Button>
                        </Form.Item>
                    </Form>
                </Card>}
            </div>
        </div>
    )
}

export default Answer
