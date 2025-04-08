import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Tabs,
  List,
  Typography,
  Space,
  Tag,
  Divider,
  message,
  Table,
  Modal,
  Form,
  InputNumber,
  Radio,
  Image,
} from "antd";
import {
  WalletOutlined,
  CreditCardOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const transactionTypeMap = {
  1: "Nạp tiền",
  2: "Giao dịch mẫu",
  3: "Tệp ghi âm",
  4: "Bài thơ",
  5: "Rút tiền",
  6: "Ủng hộ",
};

const YourWallet = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchWalletInfo = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://api-poemtown-staging.nodfeather.win/api/user-ewallets/v1/mine",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 0 && result.data) {
        setWalletBalance(result.data.walletBalance);
        setWalletStatus(result.data.walletStatus);
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      message.error("Lỗi khi lấy thông tin ví.");
    }
  };

  const fetchTransactions = async (pageNumber = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/transactions/v1/mine?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        setTransactions(result.data);
        setPagination({
          current: result.pageNumber,
          pageSize: result.pageSize,
          total: result.totalRecords,
        });
      } else {
        message.error("Không thể lấy lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Fetch transaction error:", error);
      message.error("Lỗi khi lấy lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://api-poemtown-staging.nodfeather.win/api/payment-gateways/v1",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        // Lọc chỉ những phương thức không bị suspended
        const activeMethods = result.data.filter(method => !method.isSuspended);
        setPaymentMethods(activeMethods);
      } else {
        message.error("Không thể lấy danh sách phương thức thanh toán");
      }
    } catch (error) {
      console.error("Fetch payment methods error:", error);
      message.error("Lỗi khi lấy danh sách phương thức thanh toán");
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletInfo();
    fetchTransactions(pagination.current, pagination.pageSize);
    fetchPaymentMethods();
  }, []);

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
    fetchTransactions(pagination.current, pagination.pageSize);
  };

  const handleDeposit = () => {
    setDepositModalVisible(true);
  };

  const handleDepositOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
  
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://api-poemtown-staging.nodfeather.win/api/user-ewallets/v1/deposit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: values.amount,
            paymentGatewayId: values.paymentMethod,
          }),
        }
      );
  
      const result = await response.json();
      console.log("Deposit result:", result);
  
      if (result?.paymentUrl) {
        message.success("Đang chuyển hướng đến cổng thanh toán...");
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 1000);
      } else if (result?.isSuccess) {
        message.success(result.message || "Nạp tiền thành công!");
        fetchWalletInfo();
        fetchTransactions();
        setDepositModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.message || "Nạp tiền thất bại");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      message.error("Có lỗi xảy ra khi nạp tiền");
    } finally {
      setConfirmLoading(false);
    }
  };
  
  const handleDepositCancel = () => {
    form.resetFields();
    setDepositModalVisible(false);
  };

  const transactionColumns = [
    {
      title: "Thời gian",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      render: (type) => transactionTypeMap[type] || "Không rõ",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₫${amount.toLocaleString()}`,
    },
    {
      title: "Số dư còn lại",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => `₫${balance.toLocaleString()}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Title level={2} className="text-center">
        Ví của tôi
      </Title>

      <Card
        style={{
          background: "linear-gradient(to right, #fff9db, #fff3bf)",
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Số dư hiện tại</Text>
              <Title level={3} style={{ margin: 0, color: "#389e0d" }}>
                ₫{walletBalance.toLocaleString()}
              </Title>
              {walletStatus === 1 && (
                <Tag color="orange" style={{ marginTop: 8 }}>
                  Ví đang chờ kích hoạt
                </Tag>
              )}
              {walletStatus === 2 && (
                <Tag color="green" style={{ marginTop: 8 }}>
                  Ví đang hoạt động
                </Tag>
              )}
            </div>
            <Button 
              type="primary" 
              icon={<PlusCircleOutlined />} 
              size="large"
              onClick={handleDeposit}
            >
              Nạp tiền
            </Button>
          </div>
        </Space>
      </Card>

      {/* Modal nạp tiền */}
      <Modal
        title="Nạp tiền vào ví"
        visible={depositModalVisible}
        onOk={handleDepositOk}
        confirmLoading={confirmLoading}
        onCancel={handleDepositCancel}
        okText="Xác nhận nạp tiền"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="amount"
            label="Số tiền (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { 
                type: 'number', 
                min: 10000, 
                message: 'Số tiền tối thiểu là 10,000 VNĐ' 
              },
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={10000}
              step={10000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₫\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
          >
            <Radio.Group>
              {paymentMethodsLoading ? (
                <div>Đang tải phương thức thanh toán...</div>
              ) : paymentMethods.length > 0 ? (
                paymentMethods.map(method => (
                  <Radio key={method.id} value={method.id}>
                    <Space>
                      {method.imageIcon && (
                        <Image 
                          src={method.imageIcon} 
                          alt={method.name} 
                          width={24} 
                          preview={false}
                        />
                      )}
                      {method.name}
                    </Space>
                  </Radio>
                ))
              ) : (
                <div>Không có phương thức thanh toán khả dụng</div>
              )}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane
          tab={
            <span>
              <WalletOutlined />
              Giao dịch
            </span>
          }
          key="1"
        >
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            onChange={handleTableChange}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <CreditCardOutlined />
              Thẻ đã liên kết
            </span>
          }
          key="2"
        >
          <List
            header={<Text strong>Danh sách thẻ</Text>}
            dataSource={[
              { bank: "Vietcombank", number: "**** 1234" },
              { bank: "TPBank", number: "**** 5678" },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[<Button danger type="link">Hủy liên kết</Button>]}
              >
                {item.bank} - {item.number}
              </List.Item>
            )}
          />
          <Divider />
          <Button type="dashed" block icon={<PlusCircleOutlined />}>
            Thêm thẻ mới
          </Button>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default YourWallet;