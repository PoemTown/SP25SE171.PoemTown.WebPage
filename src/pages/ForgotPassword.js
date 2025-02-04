import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError, clearSuccess } from '../redux/slices/resetPasswordSlice';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector((state) => state.passwordReset);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(decodeURIComponent(params.get('email')));
    setToken(decodeURIComponent(params.get('token')).replace(/ /g, '+'));
    setTimestamp(decodeURIComponent(params.get('timestamp')));
  }, []);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
    if (success) {
      message.success('Password reset successful!');
      navigate('/login');
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch, navigate]);

  const handlePasswordReset = () => {
    const data = {
      email,
      newPassword,
      resetPasswordToken: token,
      expiredTimeStamp: timestamp,
    };
    dispatch(resetPassword(data));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400, padding: '2rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Title level={3} style={{ textAlign: 'center' }}>Forgot Password</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '2rem', textAlign: 'center' }}>
          Please enter your new password to reset.
        </Text>
        <Form layout="vertical" onFinish={handlePasswordReset}>
          <Form.Item label="Email">
            <Input value={email} readOnly />
          </Form.Item>
          <Form.Item
            label="New Password"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block size="large" htmlType="submit" loading={loading}>
              {loading ? <Spin size="small" /> : 'Reset Password'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
