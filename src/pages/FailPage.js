import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { CloseCircleTwoTone, FrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const FailPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/user/:username');
  };

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(to bottom right, #fff5f5, #ffeaea)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Result
        status="error"
        icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: '72px' }} />}
        title={<Title level={2}>Thanh toán thất bại!</Title>}
        subTitle={
          <Typography>
            <Paragraph>Đã xảy ra lỗi trong quá trình thanh toán. 😢</Paragraph>
            <Paragraph>Vui lòng kiểm tra lại thông tin hoặc thử lại sau.</Paragraph>
          </Typography>
        }
        extra={
          <Space direction="vertical">
            <Button type="link" onClick={handleBackHome}>
              Quay về của bạn
            </Button>
          </Space>
        }
      />
      <div style={{
        marginTop: '20px',
        animation: 'shake 1s infinite'
      }}>
        <FrownOutlined style={{ fontSize: '32px', color: '#ff7875' }} />
      </div>

      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

export default FailPage;
