import { Avatar, Badge,Button, Col, Dropdown, Row, Popover, message} from "antd";
import { useEffect, useState } from "react";
import {SearchOutlined} from "@ant-design/icons";
import styles from "./header.module.scss";
import { cleanHasNew, getHasNew } from "helpers/api/user";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

const Header = () => {
  const history = useHistory();
  const [isLogin, setIsLogin] = useState(false);
  const [hasNew, setHasNew] = useState(0);

  const notificationMessage = () => {
    if (hasNew === 1) {
      return 'You have 1 new notification.';
    } else {
      return `You have ${hasNew} new notifications.`;
    }
  };

  useEffect(() => {
    const cookie = Cookies.get("token", "");
    if (cookie) {
      setIsLogin(cookie.length !== 0);
    } else {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
     const timer = setInterval(() => {
           getHasNew().then(response => {
              setHasNew(response.has_new);
             });
       }, 1000);

      return () => clearInterval(timer);
   }, []);

  /*
  const getMenu = () => {
    return [{ label: "Home", key: "/" }];
  };

   */

  const handleClick = (url) => {
    // history.push(e.key);
    window.location.href = url;
  };

  const clickLogout = () => {
    // Cookies.remove('token');
    Cookies.remove("token");

    history.push("/Login");
    window.location.reload();
  };
  const clickCenter = () => {
    cleanHasNew();
    // history.push("/Center");
    window.location.href = "/center";
    setHasNew(0);
  };
  const handleSearch = () => {
    console.log(history);
    window.location.href = "/search";
  };

  const items = [
    {
      key: "1",
      label: (
        <div onClick={clickCenter}>
          <span>User Center</span>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={clickLogout}>
          <span>Logout</span>
        </div>
      ),
    },
  ];

  return (
      <div className={styles.header}>
        <Row>
          <Col span={4}>
            <div className={styles.log}>
              <span className={styles.logo}>UZH IFI Forum</span>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff" }}>
      An online Q&A platform for UZH IFI’s study and life!
    </span>
            </div>
          </Col>
          {/*<Col span={8}>*/}
          {/*  <Row justify="end">*/}
          {/*    <Button*/}
          {/*        style={{ marginRight: "16px" }}*/}
          {/*        shape="circle"*/}
          {/*        icon={<SearchOutlined />}*/}
          {/*        onClick={handleSearch}*/}
          {/*    />*/}
          <Col span={8}>
            <Row justify="end">
              <Button
                  style={{
                    marginRight: "16px",
                    backgroundColor: "#1890ff",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px",
                    padding: "5px 10px"
                  }}
                  shape="circle"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
              />

          {isLogin ? (
                  <Dropdown
                      overlayClassName={styles.customDropdown}
                      menu={{
                        items,
                      }}
                      placement="topLeft"
                      arrow={{
                        pointAtCenter: true,
                        }}
                    >
                    <Popover
                        content={
                          <div
                              onMouseEnter={() => {
                                if (hasNew) {
                                  cleanHasNew();
                                  setHasNew(0);
                                }
                              }}
                              style={{ fontSize: '18px', fontWeight: 'bold',color: 'red' }}
                          >
                            {notificationMessage()} {/* Display the notification message */}
                          </div>}
                        title={<span style={{ color: 'blue' }}>Notification</span>}
                        trigger="hover"
                        visible={hasNew}
                        placement="bottom"
                        arrow={{
                          pointAtCenter: true,
                        }}
                        offset={[20,0]}
                    >
                      <Badge count={hasNew} style={{ backgroundColor: "#f5222d", fontSize: "8px", fontWeight: "bold", right: -5, top: -5 }}>
                        <Avatar
                            icon={
                              <img src={`https://bing.ioliu.cn/v1?d=${message.fromUserId}&w=32&h=32`} alt={'User avatar'} />
                            }
                            style={{ fontSize: "20px" }}
                        />
                      </Badge>
                    </Popover>
                  </Dropdown>
              ) : (
                  <Button
                      style={{
                        backgroundColor: "#6F3BF5",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        padding: "5px 20px"
                      }}
                      onClick={() => handleClick("/login")}
                      type={"primary"}
                  >
                    Login / Register
                  </Button>

              )}
            </Row>
          </Col>
        </Row>
      </div>
  );
};


export default Header;
