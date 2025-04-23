import React, { useState } from "react";
import { Dropdown, Menu, Badge } from "antd";
import MessengerPage from "./Chat";
import { RiMessengerLine } from "react-icons/ri";
import { TbMessage } from "react-icons/tb";

const ChatDropdown = ({ userData, refreshKey, setRefreshKey }) => {
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleChatRefresh = () => {
    // When the chat is refreshed, update the refreshKey to tr igger a re-render
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
      destroyPopupOnHide={true}
    >
      <Badge>
        <TbMessage style={{ fontSize: "24px", color: "#7d6b58" }} />
      </Badge>
    </Dropdown>
  );
};

export default ChatDropdown;
