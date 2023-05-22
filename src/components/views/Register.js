import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, message } from 'antd';
import style from 'styles/views/login.module.scss';
import { useHistory } from 'react-router-dom';
import { register } from 'helpers/api/user';


function Register() {
    const history = useHistory();
    const [form] = Form.useForm();
    const [passwordError, setPasswordError] = useState(false);
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState('');

    const onFinish = (values) => {
        values.avatar = selectedAvatar;
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

    const generateAvatars = () => {
        let seeds = ['Samantha', 'Callie', 'Garfield', 'Abby', 'Buster', 'Jack', 'Angel', 'Molly', 'Whiskers', 'Cookie', 'Callie', 'Annie', 'Sassy', 'Kiki', 'Mittens', 'Trouble', 'Bubba', 'Jasper', 'Dusty', 'Cuddles', 'Bear', 'Midnight', 'Bailey', 'Daisy', 'Scooter'];
        const newAvatars = [];
    
        // Shuffle seeds array
        for (let i = seeds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
        }
    
        for(let i=0; i<5; i++) {
            const randomSeed = seeds[i]; // Get a seed from the shuffled array
            newAvatars.push({
                url: `https://api.dicebear.com/6.x/adventurer/svg?seed=${randomSeed}&scale=90`,
                seed: randomSeed,
            });
        }
        setAvatars(newAvatars);
    };
    
    
    
    const handleAvatarClick = (avatar) => {
        setSelectedAvatar(avatar.seed); // Now storing the seed as the selected avatar
        form.setFieldsValue({
            avatar: avatar.seed, // Now setting the seed as the form value
        });
        console.log("Selected avatar: ", avatar.seed);
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

                    <Form.Item
                        name="avatar"
                        label="Choose Your Avatar"
                        rules={[{ required: true, message: 'Please select an avatar.' }]}
                        initialValue={selectedAvatar}
                    >
                        <div>
                            <Button onClick={generateAvatars}>Generate Avatars</Button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            {avatars.map((avatar, index) => (
                                <div key={index} onClick={() => handleAvatarClick(avatar)}>
                                    <img
                                        src={avatar.url}
                                        alt="Generated avatar"
                                        style={{ ...avatar.seed === selectedAvatar ? { border: '2px solid blue' } : {}, width: '100px', height: '100px' }}
                                    />
                                </div>
                            ))}
                            </div>
                            <Input type="hidden" value={selectedAvatar} />
                        </div>
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
