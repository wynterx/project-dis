import React from "react";
import io from "socket.io-client";
import {
  getUserGroup,
  resetState,
  setField,
  onConnectionChat
} from "./reducer";
import { connect } from "react-redux";
import { Layout, Menu, Icon, Input, Button, List, Avatar } from "antd";
const { Content, Sider } = Layout;

const mapStateToProps = state => {
  return {
    userInformation: state.login.userInformation,
    queryGroup: state.chat.queryGroup,
    userGroup: state.chat.userGroup,
    allGroup: state.chat.allGroup,
    rowSelected: state.chat.rowSelected,
    memberInGroup: state.chat.memberInGroup,
    currentGroup: state.chat.currentGroup,
    unreadMsg: state.chat.unreadMsg,
    menuChange: state.chat.menuChange,
    socket: state.chat.socket,
    chatPort: state.chat.chatPort
  };
};

const mapDispatchToProps = {
  getUserGroup,
  resetState,
  setField,
  onConnectionChat
};

class EachChat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: ""
    };

    this.props.socket.on("connect_error", function(data) {
      //  console.log("socket error : change to Port > " + this.props.chatPort);
      this.props.onConnectionChat();
      // this.props.onConnection();

      this.props.setField(
        "socket",
        io(`10.207.176.187:${this.props.chatPort}`)
      );
      console.log(this.props.socket);
    });

    this.props.socket.on("RECEIVE_MESSAGE", function(data) {
      console.log("receive msg jaa");
      addMessage(data);
    });

    const addMessage = res => {
      console.log("Add Msg" + res);

      const a = [];
      a.push({
        title: res.author,
        avatar: (
          <Avatar
            style={{
              backgroundColor: res.color,
              verticalAlign: "middle"
            }}
            size="large"
          >
            {res.author.substring(0, 1)}
          </Avatar>
        ),
        description: res.time,
        content: res.message
      });

      this.props.setField("unreadMsg", [...this.props.unreadMsg, ...a]);
      console.log(this.props.unreadMsg);
      console.log("------------");
      console.log(res);
      console.log("------------");
      res["me"] = this.props.userInformation.username;
      console.log(res);
      console.log(this.props.socket.emit("sun", res));
    };

    this.sendMessage = ev => {
      ev.preventDefault();
      this.props.socket.emit("SEND_MESSAGE", {
        groupName: this.props.currentGroup,
        author: this.props.userInformation.username,
        color: this.props.userInformation.color,
        message: this.state.message
      });
      this.setState({ message: "" });
    };
  }

  render() {
    const props = this.props;
    if (props.menuChange) {
      this.props.socket.emit("joinroom", {
        groupName: props.currentGroup
      });
      this.props.setField("menuChange", false);
    }
    return (
      <div>
        <div
          style={{
            backgroundColor: "#f2f3f5",
            height: "50px",
            width: "100%",
            top: 65,
            left: 200,
            position: "fixed",
            zIndex: 1000
          }}
        >
          <h3
            style={{
              padding: "15px 0px 0px 15px"
            }}
          >
            {this.props.currentGroup}
          </h3>
        </div>
        <Layout style={{ padding: 0 }}>
          <Layout
            style={{
              marginTop: 115,
              marginLeft: 200,
              marginRight: 200
            }}
          >
            <Content
              style={{
                background: "white",
                minWidth: "100%",
                overflow: "auto"
              }}
            >
              <List
                style={{
                  marginLeft: 50,
                  marginRight: 50,
                  marginBottom: 20,
                  width: "85%"
                }}
                itemLayout="horizontal"
                dataSource={this.props.unreadMsg}
                renderItem={item => (
                  <List.Item key={item.title}>
                    <List.Item.Meta
                      avatar={item.avatar}
                      title={item.title}
                      description={item.description}
                    />
                    {item.content}
                  </List.Item>
                )}
              />
            </Content>
            <Input
              placeholder="Message"
              value={this.state.message}
              onChange={e => this.setState({ message: e.target.value })}
              style={{
                paddingLeft: 400,
                position: "fixed",
                bottom: 0,
                right: 200
              }}
              onPressEnter={e => this.sendMessage(e)}
              addonAfter={
                <Button
                  type="primary"
                  onClick={e => this.sendMessage(e)}
                  style={{
                    width: 100,
                    padding: 0,
                    margin: -11
                  }}
                >
                  Send
                </Button>
              }
            />
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EachChat);
