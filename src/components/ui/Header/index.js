import { Avatar, Badge,Button, Col, Dropdown, Row, Popover, message} from "antd";
import { useEffect, useState } from "react";
import {
  AlertTwoTone,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./header.module.scss";
import { cleanHasNew, getHasNew } from "helpers/api/user";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";
import SockJS from "sockjs-client";
import { over } from "stompjs";
var stompClient = null;
const Header = () => {
  const history = useHistory();
  const [isLogin, setIsLogin] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("token", "");
    if (cookie) {
      setIsLogin(cookie.length !== 0);
    } else {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
      var newSocket = new SockJS("http://localhost:8080/my-websocket");
      stompClient = over(newSocket);
      stompClient.connect({}, connectSuccess, connectError);
    }, []);

  const connectSuccess = () =>{
    stompClient.subscribe('/topic/has_new/'+Cookies.get("token", ""),(msg) =>{
      let body = JSON.parse(msg.body)
      setHasNew(body.has_new);
    })}
  const connectError= (err) => {
    console.log("网络异常")
  }

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
    window.location.href ="/Login";


    window.location.reload();
  };
  const clickCenter = () => {
    cleanHasNew();
    setHasNew(0);
    // history.push("/Center");
    const cookie = Cookies.get("token", "");
    // history.push(`/index/${page}`);
    window.location.href = `/center/${cookie}`;

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
          <span>Center</span>
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

  const notificationMessage= ()=> {
    if (hasNew === 1) {
      return 'You have 1 new notification.';
    } else {
      return `You have ${hasNew} new notifications.`;
    }
  }

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
              menu={{
                items,
              }}
              placement="topRight"
              arrow={{
                pointAtCenter: true,
              }}
            >
              {/*{hasNew ? (*/}
              {/*  <Avatar icon={<AlertTwoTone />} />*/}
              {/*) : (*/}
              {/*  <Avatar icon={<UserOutlined />} />*/}
              {/*)}*/}
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
                offset={[10,20]}
              >
                {
                  hasNew > 0 ?
                    (
                      <Badge
                        count={hasNew}
                        style={{ backgroundColor: "#f5222d", fontSize: "8px", fontWeight: "bold", right: -5, top: -5 }}
                        offset={[0, 0]}
                      >
                        <Avatar icon={<UserOutlined />} style={{ fontSize: "20px" }} />
                      </Badge>
                    ) :
                    (
                      <Avatar icon={<UserOutlined />} style={{ fontSize: "20px" }} />
                    )
                }
              </Popover>
            </Dropdown>
          ) : (
            <Button
              style={{ backgroundColor: "#6F3BF5" }}
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
