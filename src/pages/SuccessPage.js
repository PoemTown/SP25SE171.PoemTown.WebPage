import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { CheckCircleTwoTone, SmileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const SuccessPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    const username = localStorage.getItem("username");
    navigate(`/user/${username}`);
  };

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(to bottom right, #ffffff, #f0f9f4)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Result
        icon={<CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '72px' }} />}
        title={<Title level={2}>Thanh toán thành công!</Title>}
        subTitle={
          <Typography>
            <Paragraph>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. 🐾</Paragraph>
            <Paragraph>Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.</Paragraph>
          </Typography>
        }
        extra={
          <Space direction="vertical">
            <Button type="primary" shape="round" size="large" onClick={handleBackHome}>
              Quay lại trang của bạn
            </Button>
          </Space>
        }
      />
      <div style={{
        marginTop: '20px',
        animation: 'bounce 2s infinite'
      }}>
        <SmileOutlined style={{ fontSize: '32px', color: '#faad14' }} />
      </div>

      {/* Internal keyframes styling */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default SuccessPage;
