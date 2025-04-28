import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  DatePicker,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  message
} from "antd";
import { MailOutlined, LockOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment/moment";

const { Title, Text } = Typography;
const { Option } = Select;

const SignupPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!values.agreeTerms) {
      message.error("Bạn phải đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/authentications/v1/registration`,
        {
          username: values.username,
          email: values.email,
          password: values.password,
          phoneNumber: values.phoneNumber,
          fullName: values.fullName,
          gender: values.gender,
          address: values.address,
          dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
        }
      );

      message.success("Đăng ký thành công!");
      navigate("/confirm-email", { state: { email: values.email } });
    } catch (error) {
      console.error("Registration failed:", error.response || error.message);
      message.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current > moment().endOf("day");
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        margin: 0
      }}
    >
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card
          style={{
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Title level={3} style={{ textAlign: "center", marginBottom: 8 }}>
            Đăng ký tài khoản
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 32 }}>
            Bắt đầu hành trình của bạn ngay hôm nay
          </Text>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            scrollToFirstError
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Email không hợp lệ!" },
                    { required: true, message: "Vui lòng nhập email!" }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { pattern: /^\d+$/, message: "Chỉ được nhập số!" },
                    { len: 10, message: "Số điện thoại phải có 10 chữ số!" }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0987xxxxxx"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  initialValue="male"
                >
                  <Select>
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={disabledDate}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="agreeTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error("Bạn cần đồng ý điều khoản!"))
                }
              ]}
            >
              <Checkbox>
                Tôi đồng ý với <a href="/terms">điều khoản và điều kiện</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ height: 40 }}
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Divider>Hoặc</Divider>

            <Row gutter={16}>
              <Col span={24}>
                <Button
                  block
                  onClick={() => navigate("/login")}
                  style={{ marginBottom: 16 }}
                >
                  Đã có tài khoản? Đăng nhập ngay
                </Button>
                <Button
                  block
                  onClick={() => navigate("/")}
                >
                  Quay về trang chủ
                </Button>
              </Col>
            </Row>


          </Form>
        </Card>
      </Col>
      {/* <Col
        xs={0}
        md={12}
        lg={14}
        style={{
          height: "100vh",
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), 
            url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "flex-end"
        }}
      >
        <div style={{
          padding: "40px",
          color: "white",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <Title
            level={2}
            style={{
              color: "white",
              fontSize: "2.5rem",
              lineHeight: 1.2
            }}
          >
            Khám phá thế giới thơ ca
          </Title>
          <Text
            style={{
              color: "white",

              fontSize: "1.2rem",
              display: "block",
              marginTop: "16px"
            }}
          >
            Kết nối với cộng đồng yêu thơ lớn nhất Việt Nam
          </Text>
        </div>
      </Col> */}

    </Row>
  );
};

export default SignupPage;