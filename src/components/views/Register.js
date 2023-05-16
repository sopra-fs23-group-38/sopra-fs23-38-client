import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, message } from 'antd';
import style from 'styles/views/login.module.scss';
import { useHistory } from 'react-router-dom';
import { register } from 'helpers/api/user';


function Register() {
    const history = useHistory();
    const [form] = Form.useForm();
    const [passwordError, setPasswordError] = useState(false);

    const onFinish = (values) => {
        register(values).then((response) => {
            if (response.success === 'false') {
                message.error(response.reason);
            } else {
                message.info('Register successfully.');
                history.push('/login').then(() => {
                    window.location.reload();
                });
            }
        });
    };

    const handlePasswordConfirm = (rule, value, callback) => {
        const password = form.getFieldValue('password');

        if (value && value !== password) {
            setPasswordError(true);
            callback('The passwords you entered do not match!');
        } else {
            setPasswordError(false);
            callback();
        }
    };

    const emailValidationPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    return (
        <div className={style.container}>
            <div className={style.main}>
                <p className={style.formTitle}>
                    Please Login / <span className={style.highlight}>Register</span> !
                </p>
                <Form
                    name="loginForm"
                    style={{ width: '400px', textAlign: 'center' }}
                    onFinish={onFinish}
                    form={form}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'please input your username.' }]}
                    >
                        <Input style={{ width: '240px' }} size={'large'} placeholder={'Username'} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'please input your password.' }]}
                    >
                        <Input.Password style={{ width: '240px' }} size={'large'} placeholder={'Password'} />
                    </Form.Item>

                    <Form.Item
                        name="repeatPassword"
                        dependencies={['password']}
                        hasFeedback
                        validateStatus={passwordError ? 'error' : ''}
                        rules={[
                            { required: true, message: 'please input your password.' },
                            () => ({
                                validator: (_, value, callback) => {
                                    handlePasswordConfirm(_, value, callback);
                                },
                            }),
                        ]}
                    >
                        <Input.Password style={{ width: '240px' }} size={'large'} placeholder={'Repeat Password'} />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                          { required: true, message: 'Please input your email.' },
                          { pattern: emailValidationPattern, message: 'Please enter a valid email address.' }
                      ]}
                    >
                        <Input
                          style={{ width: '240px' }}
                          size="large"
                          placeholder="Enter email"
                        />
                    </Form.Item>

                    <Form.Item name="birthday">
                        <Input style={{ width: '240px' }} size={'large'} placeholder={'Enter Birthday (optional)'} />
                    </Form.Item>

                    <Row style={{ marginTop: '48px' }}>
                        <Col span={12}>
                            <Button
                                onClick={() => history.push('/login')}
                                style={{ borderColor: '#6F3BF5', color: '#6F3BF5', width: 160 }}
                                shape={'round'}
                                size={'large'}
                                htmlType="submit"
                            >
                                Login
                            </Button>
                        </Col>

                        <Col span={12}>
                            <Button
                                htmlType={'submit'}
                                style={{ backgroundColor: '#6F3BF5', width: 160 }} type="primary" shape={"round"} size={"large"}>
                                Register
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    )
}


/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default Register;
