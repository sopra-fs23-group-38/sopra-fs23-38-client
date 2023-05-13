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
        <Col span={2} offset={2}>
          <div className={styles.log}>
            <span className={styles.logo}>Group38</span>
          </div>
        </Col>
        <Col span={14}>
          <Button
            onClick={() => handleClick("/")}
            type={"text"}
            style={{ color: "#000", fontSize: "16px" }}
          >
            Home
          </Button>

          {/*<Menu className={styles.menu} mode={"horizontal"} items={getMenu()} onClick={handleClick} />*/}
        </Col>
        <Col span={4} offset={2}>
          <Button
            style={{ marginRight: "16px" }}
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
              placement="bottomRight"
              arrow={{
                pointAtCenter: true,
              }}
              offset={[50, 0]}
              // onMouseEnter={() => {
              //   if (hasNew) {
              //     cleanHasNew();
              //     setHasNew(false);
              //   }
              // }}
            >
              {/* {hasNew ? (
                <Avatar icon={<AlertTwoTone />} />
              ) : (
                <Avatar icon={<UserOutlined />} />
              )} */}

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
                  {/*<Badge count={hasNew} style={{ backgroundColor: "#f5222d", fontSize: "8px", fontWeight: "bold", right: -5, top: -5 }}>*/}
                  {/*    <Avatar icon={<UserOutlined />} style={{ fontSize: "20px" }} />*/}
                  {/*</Badge>*/}
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
              style={{ backgroundColor: "#6F3BF5" }}
              onClick={() => handleClick("/login")}
              type={"primary"}
            >
              Login / Register
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Header;
