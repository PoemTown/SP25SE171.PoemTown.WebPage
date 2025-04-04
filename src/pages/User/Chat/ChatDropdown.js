import React, { useState } from "react";
import { Dropdown, Menu, Badge } from "antd";
import MessengerPage from "./Chat";
import { RiMessengerLine } from "react-icons/ri";

const ChatDropdown = ({ userData, refreshKey, setRefreshKey }) => {
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleChatRefresh = () => {
    // When the chat is refreshed, update the refreshKey to trigger a re-render
    setRefreshKey(prevKey => prevKey + 1);
  };

  const chatMenu = (
    <Menu onClick={(e) => e.domEvent.stopPropagation()}>
      <Menu.Item key="chat">
        {/* Pass the refreshKey to MessengerPage */}
        <MessengerPage userData={userData} refreshKey={refreshKey} onRefresh={handleChatRefresh} />
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={chatMenu}
      trigger={["click"]}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomCenter"
    >
      <Badge>
        <RiMessengerLine style={{ fontSize: "24px", color: "#4A90E2" }} />
      </Badge>
    </Dropdown>
  );
};

export default ChatDropdown;
