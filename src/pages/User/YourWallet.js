import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Tabs,
  Typography,
  Space,
  Tag,
  message,
  Table,
  Modal,
  Form,
  InputNumber,
  Radio,
  Image,
  Descriptions,
  Badge,
  Spin,
  List,
  Tooltip,
  Input,
  Select
} from "antd";
import {
  WalletOutlined,
  ShoppingOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FormOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const transactionTypeMap = {
  1: "Nạp tiền",
  2: "Giao dịch mẫu",
  3: "Tệp ghi âm",
  4: "Bài thơ",
  5: "Rút tiền",
  6: "Ủng hộ",
  7: "Tiền hoa hồng", 
  8: "Hoàn tiền",
  9: "Phí dịch vụ nạp tiền"
};

const orderTypeMap = {
  1: { text: "Nạp tiền ví", icon: <WalletOutlined /> },
  2: { text: "Mẫu giao dịch", icon: <FormOutlined /> },
  3: { text: "Tệp ghi âm", icon: <FileOutlined /> },
  4: { text: "Bài thơ", icon: <FormOutlined /> },
};

const orderStatusMap = {
  1: { text: "Chờ thanh toán", color: "orange", icon: <ClockCircleOutlined /> },
  2: { text: "Đã thanh toán", color: "green", icon: <CheckCircleOutlined /> },
  3: { text: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
};
const transactionStatusMap = {
  1: { text: "Chờ thanh toán", color: "orange", icon: <ClockCircleOutlined /> },
  2: { text: "Đã thanh toán", color: "green", icon: <CheckCircleOutlined /> },
  3: { text: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
};

const withdrawalStatusMap = {
  3: { text: "Chờ xử lý", color: "orange", icon: <ClockCircleOutlined /> },
  1: { text: "Đã xử lý", color: "green", icon: <CheckCircleOutlined /> },
  2: { text: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
};

const bankTypeMap = {
  1: "Momo",
  2: "TpBank",
  3: "BIDV",
  4: "Agribank",
  5: "VietinBank",
  6: "MB Bank",
  7: "ACB",
  8: "VPBank",
  9: "Sacombank",
  10: "SHB",
};

const YourWallet = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [orderPagination, setOrderPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [withdrawConfirmLoading, setWithdrawConfirmLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  // Fetch wallet info
  const fetchWalletInfo = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Vui lòng đăng nhập để sử dụng ví");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/mine`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result && typeof result.walletBalance !== 'undefined') {
        setWalletBalance(result.walletBalance);
        setWalletStatus(result.walletStatus);
        setWalletId(result.id);

        console.log('Wallet info fetched:', {
          balance: result.walletBalance,
          status: result.walletStatus,
          id: result.id
        });
      } else {
        message.error("Dữ liệu ví không hợp lệ");
        setWalletBalance(0);
        setWalletStatus(null);
        setWalletId(null);
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      message.error("Lỗi khi lấy thông tin ví");
      setWalletBalance(0);
      setWalletStatus(null);
      setWalletId(null);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (pageNumber = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/transactions/v1/mine?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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

  // Fetch orders
  const fetchOrders = async (pageNumber = 1, pageSize = 10) => {
    setOrderLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/orders/v1?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        setOrders(result.data);
        setOrderPagination({
          current: result.pageNumber,
          pageSize: result.pageSize,
          total: result.totalRecords,
        });
      } else {
        message.error("Không thể lấy danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      message.error("Lỗi khi lấy danh sách đơn hàng");
    } finally {
      setOrderLoading(false);
    }
  };

  // Fetch withdrawals
  const fetchWithdrawals = async (pageNumber = 1, pageSize = 10) => {
    setWithdrawalLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/withdrawal-forms/v1/mine?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        setWithdrawals(result.data);
        setWithdrawalPagination({
          current: result.pageNumber,
          pageSize: result.pageSize,
          total: result.totalRecords,
        });
      } else {
        message.error(result.message || "Không thể lấy lịch sử rút tiền");
      }
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      message.error("Lỗi khi lấy lịch sử rút tiền");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Fetch order detail
  const fetchOrderDetail = async (orderId) => {
    setOrderDetailLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/orders/v1/detail/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        setOrderDetail(result.data);
      } else {
        message.error(result.message || "Không thể lấy chi tiết đơn hàng");
      }
    } catch (error) {
      console.error("Fetch order detail error:", error);
      message.error("Lỗi khi lấy chi tiết đơn hàng");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/payment-gateways/v1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200) {
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
    fetchOrders(orderPagination.current, orderPagination.pageSize);
    fetchWithdrawals(withdrawalPagination.current, withdrawalPagination.pageSize);
  }, []);

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
    fetchTransactions(pagination.current, pagination.pageSize);
  };

  const handleOrderTableChange = (pagination) => {
    setOrderPagination({
      ...pagination,
    });
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleWithdrawalTableChange = (pagination) => {
    setWithdrawalPagination({
      ...pagination,
    });
    fetchWithdrawals(pagination.current, pagination.pageSize);
  };

  const handleDeposit = () => {
    setDepositModalVisible(true);
  };

  const handleWithdraw = () => {
    setWithdrawModalVisible(true);
  };

  const handleDepositOk = async () => {
    try {
      const values = await depositForm.validateFields();
      setConfirmLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/deposit`,
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

      if (result?.paymentUrl) {
        message.success("Đang chuyển hướng đến cổng thanh toán...");
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 1000);
      } else if (result?.isSuccess) {
        message.success(result.message || "Nạp tiền thành công!");
        fetchWalletInfo();
        fetchTransactions();
        fetchOrders();
        setDepositModalVisible(false);
        depositForm.resetFields();
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
    depositForm.resetFields();
    setDepositModalVisible(false);
  };

  const handleWithdrawSubmit = async () => {
    try {
      const values = await withdrawForm.validateFields();
      setWithdrawConfirmLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      
      if (!walletId) {
        message.error("Không tìm thấy thông tin ví");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/withdrawal-form?userEWalletId=${walletId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: values.amount,
            bankType: values.bankType,
            description: values.description || "Yêu cầu rút tiền từ ví",
            accountName: values.accountName,
            accountNumber: values.accountNumber
          }),
        }
      );

      const result = await response.json();

      if (result?.statusCode === 201) {
        message.success(result.message || "Yêu cầu rút tiền thành công!");
        fetchWalletInfo();
        fetchWithdrawals();
        setWithdrawModalVisible(false);
        withdrawForm.resetFields();
      } else {
        message.error(result.message || "Rút tiền thất bại");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      message.error("Có lỗi xảy ra khi rút tiền");
    } finally {
      setWithdrawConfirmLoading(false);
    }
  };

  const handleWithdrawCancel = () => {
    withdrawForm.resetFields();
    setWithdrawModalVisible(false);
  };

  const handleViewOrderDetail = async (order) => {
    setSelectedOrder(order);
    setOrderDetailModalVisible(true);
    await fetchOrderDetail(order.id);
  };

  const handleOrderDetailClose = () => {
    setOrderDetailModalVisible(false);
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  const renderOrderItems = () => {
    if (!orderDetail?.orderDetails?.length) return "Không có chi tiết sản phẩm";

    return (
      <List
        itemLayout="vertical"
        dataSource={orderDetail.orderDetails}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Số lượng">{item.itemQuantity}</Descriptions.Item>
              <Descriptions.Item label="Đơn giá">₫{item.itemPrice?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Thành tiền">
                <Text strong>₫{(item.itemPrice * item.itemQuantity)?.toLocaleString()}</Text>
              </Descriptions.Item>
              {item.recordFile && (
                <>
                  <Descriptions.Item label="Loại sản phẩm">Tệp ghi âm</Descriptions.Item>
                  <Descriptions.Item label="Tên file">{item.recordFile.name}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả">{item.recordFile.description}</Descriptions.Item>
                </>
              )}
              {item.masterTemplate && (
                <>
                  <Descriptions.Item label="Loại sản phẩm">Mẫu giao dịch</Descriptions.Item>
                  <Descriptions.Item label="Tên mẫu">{item.masterTemplate.name}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả">{item.masterTemplate.description}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </List.Item>
        )}
      />
    );
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = transactionStatusMap[status]?.color || "default";
        const text = transactionStatusMap[status]?.text || "Không xác định";

        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transactionCode",
      key: "transactionCode",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => {
        const { amount, isAddToWallet } = record;

        if (amount == null) return "";

        const sign = isAddToWallet === true ? "+" : isAddToWallet === false ? "-" : "";
        return `${sign}₫${amount.toLocaleString()}`;
      },
    },
    {
      title: "Số dư còn lại",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => `₫${balance?.toLocaleString()}`,
    },
  ];

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Loại đơn hàng",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Space>
          {orderTypeMap[type]?.icon}
          {orderTypeMap[type]?.text || "Không rõ"}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "orderDescription",
      key: "orderDescription",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount > 0 ? `₫${amount?.toLocaleString()}` : "Miễn phí",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = orderStatusMap[status]?.color || "default";
        const text = orderStatusMap[status]?.text || "Không xác định";

        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrderDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const withdrawalColumns = [
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "N/A",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `-₫${amount?.toLocaleString() || '0'}`,
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankType",
      key: "bankType",
      render: (type) => bankTypeMap[type] || `Ngân hàng ${type}`,
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNumber",
      key: "accountNumber",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "accountName",
      key: "accountName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusInfo = withdrawalStatusMap[status] || {
          text: "Không xác định",
          color: "default"
        };
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.icon && (
              <span style={{ marginRight: 4 }}>{statusInfo.icon}</span>
            )}
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            Modal.info({
              title: `Chi tiết yêu cầu rút tiền #${record.id}`,
              width: 800,
              content: (
                <div>
                  <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Phản hồi chi tiết">
                      {record.resolveDescription || "Chưa có phản hồi"}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Bằng chứng">
                      {record.resolveEvidence ? (
                        /\.(jpg|jpeg|png|gif)$/i.test(record.resolveEvidence) ? (
                          <Image
                            width="100%"
                            src={record.resolveEvidence}
                            preview={{
                              src: record.resolveEvidence,
                            }}
                          />
                        ) : (
                          <Button
                            type="link"
                            icon={<FileOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(record.resolveEvidence, '_blank');
                            }}
                          >
                            Xem file đính kèm
                          </Button>
                        )
                      ) : (
                        "Không có bằng chứng"
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            });
          }}
        >
          Xem chi tiết
        </Button>
      ),
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
                ₫{walletBalance?.toLocaleString() || '0'}
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
            <Space>
              <Button
                type="primary"
                icon={<MoneyCollectOutlined />}
                size="large"
                onClick={handleWithdraw}
                style={{ marginTop: 16 }}
              >
                Rút tiền
              </Button>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                size="large"
                onClick={handleDeposit}
                style={{ marginTop: 16 }}
              >
                Nạp tiền
              </Button>
            </Space>
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
        <Form form={depositForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Số tiền (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                type: 'number',
                min: 20000,
                message: 'Số tiền tối thiểu là 20,000 VNĐ',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={20000}
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
            {paymentMethodsLoading ? (
              <div>Đang tải phương thức thanh toán...</div>
            ) : paymentMethods.length > 0 ? (
              <Radio.Group style={{ width: '90%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        padding: 12,
                        width: '100%',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <Radio value={method.id} style={{ marginRight: 16 }} />
                      <Space style={{ flexGrow: 1 }}>
                        {method.imageIcon && (
                          <Image
                            src={method.imageIcon}
                            alt={method.name}
                            width={32}
                            preview={false}
                          />
                        )}
                        <span style={{ fontSize: 16, fontWeight: 500 }}>{method.name}</span>
                      </Space>
                      {method.cardIcons?.length > 0 && (
                        <Space>
                          {method.cardIcons.map((icon, idx) => (
                            <Image
                              key={idx}
                              src={icon}
                              width={28}
                              preview={false}
                            />
                          ))}
                        </Space>
                      )}
                    </div>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <div>Không có phương thức thanh toán khả dụng</div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal rút tiền */}
      <Modal
        title="Rút tiền từ ví"
        visible={withdrawModalVisible}
        onOk={handleWithdrawSubmit}
        confirmLoading={withdrawConfirmLoading}
        onCancel={handleWithdrawCancel}
        okText="Xác nhận rút tiền"
        cancelText="Hủy bỏ"
      >
        <Form form={withdrawForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Số tiền muốn rút (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                type: 'number',
                min: 50000,
                max: walletBalance,
                message: `Số tiền phải từ 50,000 VNĐ`,
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={50000}
              max={walletBalance}
              step={10000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₫\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="bankType"
            label="Ngân hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select placeholder="Chọn ngân hàng">
              {Object.entries(bankTypeMap).map(([value, label]) => (
                <Option key={value} value={parseInt(value)}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản" },
              { pattern: /^[0-9]+$/, message: "Số tài khoản chỉ được chứa số" },
              { min: 8, message: "Số tài khoản tối thiểu 8 ký tự" },
              { max: 20, message: "Số tài khoản tối đa 20 ký tự" },
            ]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" />
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Tên chủ tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
              { pattern: /^[a-zA-Z\sÀ-ỹ]+$/, message: "Tên chỉ được chứa chữ cái và dấu cách" },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản (VIETTEL)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả (tuỳ chọn)"
          >
            <Input.TextArea placeholder="Nhập mô tả (nếu có)" rows={3} />
          </Form.Item>

          <div style={{ color: '#faad14', marginBottom: 16 }}>
            <Text>
              Lưu ý: Thời gian xử lý rút tiền từ 1-3 ngày làm việc. Phí rút tiền tối thiểu phải là 50,000 VNĐ.
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode || ''}`}
        visible={orderDetailModalVisible}
        onCancel={handleOrderDetailClose}
        footer={[
          <Button key="close" onClick={handleOrderDetailClose}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Spin spinning={orderDetailLoading}>
          {orderDetail ? (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">
                <Text strong>{orderDetail.orderCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại đơn hàng">
                <Space>
                  {orderTypeMap[orderDetail.type]?.icon}
                  {orderTypeMap[orderDetail.type]?.text || "Không rõ"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {orderDetail.orderDescription}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  color={orderStatusMap[orderDetail.status]?.color}
                  text={
                    <Space>
                      {orderStatusMap[orderDetail.status]?.icon}
                      {orderStatusMap[orderDetail.status]?.text || "Không xác định"}
                    </Space>
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo đơn">
                {dayjs(orderDetail.orderDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {orderDetail.paidDate && (
                <Descriptions.Item label="Ngày thanh toán">
                  {dayjs(orderDetail.paidDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              {orderDetail.cancelledDate && (
                <Descriptions.Item label="Ngày hủy">
                  {dayjs(orderDetail.cancelledDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tổng tiền">
                <Text strong type="success">
                  {orderDetail.amount > 0
                    ? `₫${orderDetail.amount?.toLocaleString()}`
                    : "Miễn phí"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã token">
                <Text code>{orderDetail.orderToken}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Chi tiết sản phẩm">
                {renderOrderItems()}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div>Không tìm thấy thông tin đơn hàng</div>
          )}
        </Spin>
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
              <ShoppingOutlined />
              Danh sách đơn hàng
            </span>
          }
          key="2"
        >
          <Table
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            loading={orderLoading}
            pagination={{
              ...orderPagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
            onChange={handleOrderTableChange}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <MoneyCollectOutlined />
              Lịch sử rút tiền
            </span>
          }
          key="3"
        >
          <Table
            columns={withdrawalColumns}
            dataSource={withdrawals}
            rowKey="id"
            loading={withdrawalLoading}
            pagination={{
              ...withdrawalPagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
            onChange={handleWithdrawalTableChange}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default YourWallet;