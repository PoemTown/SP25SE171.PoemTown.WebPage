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
  Input,
  Select,
  Skeleton,
  Upload,
  Divider,
  Row,
  Col,
  Collapse
} from "antd";
import {
  WalletOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  SwapOutlined,
  FileOutlined,
  FormOutlined,
  MoneyCollectOutlined,
  UploadOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const transactionTypeMap = {
  1: { text: "Nạp tiền", icon: <WalletOutlined /> },
  2: { text: "Giao dịch mẫu", icon: <FormOutlined /> },
  3: { text: "Tệp ghi âm", icon: <FileOutlined /> },
  4: { text: "Bài thơ", icon: <FormOutlined /> },
  5: { text: "Rút tiền", icon: <MoneyCollectOutlined /> },
  6: { text: "Ủng hộ", icon: <WalletOutlined /> },
  7: { text: "Tiền hoa hồng", icon: <WalletOutlined /> },
  8: { text: "Hoàn tiền", icon: <WalletOutlined /> },
  9: { text: "Phí dịch vụ nạp tiền", icon: <WalletOutlined /> },
  10: { text: "Nhận ủng hộ", icon: <WalletOutlined /> }
};

const transactionStatusMap = {
  1: { text: "Đang xử lý", color: "orange", icon: <ClockCircleOutlined /> },
  2: { text: "Đã thanh toán", color: "green", icon: <CheckCircleOutlined /> },
  3: { text: "Đã hủy", color: "red", icon: <CloseCircleOutlined /> },
  4: { text: "Đã hoàn tiền", color: "blue", icon: <RollbackOutlined /> },
  5: { text: "Đã chuyển khoản", color: "purple", icon: <SwapOutlined /> },
};

const complaintStatusMap = {
  3: { text: "Đang chờ", color: "gold", icon: <ClockCircleOutlined /> },
  1: { text: "Đã chấp nhận", color: "green", icon: <CheckCircleOutlined /> },
  2: { text: "Đã từ chối", color: "red", icon: <CloseCircleOutlined /> },
};

const getWithdrawalFormStatus = (status) => {
  switch (status) {
    case 1:
      return <Tag color="success">Đã giải quyết</Tag>;
    case 2:
      return <Tag color="error">Đã từ chối</Tag>;
    case 3:
      return <Tag color="processing">Đang xử lý</Tag>;
    default:
      return <Tag color="default">Không xác định</Tag>;
  }
};
const YourWallet = () => {
  // State management
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletStatus, setWalletStatus] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPagination, setTransactionsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [transactionDetailModalVisible, setTransactionDetailModalVisible] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [transactionDetailLoading, setTransactionDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [accountSettingModalVisible, setAccountSettingModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [withdrawConfirmLoading, setWithdrawConfirmLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [inUseFee, setInUseFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [exampleVisible, setExampleVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [currentWithdrawalId, setCurrentWithdrawalId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [editStep, setEditStep] = useState(1);
  const [editInfoVisible, setEditInfoVisible] = useState(false);
  const [editImagesVisible, setEditImagesVisible] = useState(false);
  const [bankTypes, setBankTypes] = useState([]);
  const [bankTypesLoading, setBankTypesLoading] = useState(false);
  const [userBankAccounts, setUserBankAccounts] = useState([]);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loadingUserAccounts, setLoadingUserAccounts] = useState(false);
  const [accountForm] = Form.useForm();
  const [accountSelectionVisible, setAccountSelectionVisible] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintPagination, setComplaintPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);

  // Fetch data functions
  const fetchWalletInfo = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Vui lòng đăng nhập để sử dụng ví");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/mine`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = response.data;
      if (result && typeof result.walletBalance !== 'undefined') {
        setWalletBalance(result.walletBalance);
        setWalletStatus(result.walletStatus);
        setWalletId(result.id);
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

  const fetchTransactions = async (pageNumber = 1, pageSize = 10) => {
    setTransactionsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/transactions/v1/mine`,
        {
          params: { pageNumber, pageSize },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = response.data;
      console.log(response.data)
      if (result.statusCode === 200) {
        setTransactions(result.data);
        setTransactionsPagination({
          current: result.pageNumber,
          pageSize: result.pageSize,
          total: result.totalRecords,
        });
      } else {
        message.error(result.message || "Không thể lấy lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Fetch transactions error:", error);
      message.error("Lỗi khi lấy lịch sử giao dịch");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchTransactionDetail = async (transactionId) => {
    setTransactionDetailLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/transactions/v1/user/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        setTransactionDetail(response.data.data);
        console.log("ád", response.data.data);
      } else {
        message.error(response.data.message || "Không thể lấy chi tiết giao dịch");
      }
    } catch (error) {
      console.error("Fetch transaction detail error:", error);
      message.error("Lỗi khi lấy chi tiết giao dịch");
    } finally {
      setTransactionDetailLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/payment-gateways/v1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        const activeMethods = response.data.data.filter(method => !method.isSuspended);
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

  const fetchComplaints = async (pageNumber = 1, pageSize = 10) => {
    setComplaintLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/mine?sortOptions=2`,
        {
          params: { pageNumber, pageSize },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        setComplaints(response.data.data);
        setComplaintPagination({
          current: response.data.pageNumber,
          pageSize: response.data.pageSize,
          total: response.data.totalRecords,
        });
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách phản hồi");
    } finally {
      setComplaintLoading(false);
    }
  };

  const fetchBankTypes = async () => {
    setBankTypesLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setBankTypes(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách ngân hàng");
    } finally {
      setBankTypesLoading(false);
    }
  };

  const fetchUserBankAccounts = async () => {
    setLoadingUserAccounts(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/user-bank-types`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserBankAccounts(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách tài khoản ngân hàng");
    } finally {
      setLoadingUserAccounts(false);
    }
  };

  // Handle functions
  const handleTransactionsTableChange = (pagination) => {
    setTransactionsPagination(pagination);
    fetchTransactions(pagination.current, pagination.pageSize);
  };

  const handleDeposit = () => {
    setDepositModalVisible(true);
  };

  const handleAccountSetting = () => {
    setAccountSettingModalVisible(true);
  };

  const handleWithdraw = () => {
    setAccountSelectionVisible(true);
  };

  const handleDepositOk = async () => {
    try {
      const values = await depositForm.validateFields();
      setConfirmLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/deposit`,
        {
          amount: values.amount,
          paymentGatewayId: values.paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = response.data;

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
        depositForm.resetFields();
      } else {
        message.error(result.message || "Nạp tiền thất bại");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi nạp tiền");
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

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/withdrawal-form?userEWalletId=${walletId}`,
        {
          amount: values.amount,
          bankTypeId: values.bankType,
          description: values.description || "Yêu cầu rút tiền từ ví",
          accountName: values.accountName,
          accountNumber: values.accountNumber
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = response.data;

      if (result?.statusCode === 201) {
        message.success("Yêu cầu rút tiền đã được gửi thành công!");
        fetchWalletInfo();
        fetchTransactions();
        setWithdrawModalVisible(false);
        withdrawForm.resetFields();
      } else {
        message.error(result.message || "Rút tiền thất bại");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi rút tiền");
    } finally {
      setWithdrawConfirmLoading(false);
    }
  };

  const handleWithdrawCancel = () => {
    withdrawForm.resetFields();
    setWithdrawModalVisible(false);
  };

  const handleAccountSubmit = async (values) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (isEditingAccount) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/user-bank-types`,
          {
            ...values,
            id: currentAccount.id
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        message.success("Cập nhật tài khoản thành công");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/user-bank-types`,
          values,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        message.success("Thêm tài khoản thành công");
      }
      fetchUserBankAccounts();
      accountForm.resetFields();
      setIsEditingAccount(false);
      setCurrentAccount(null);
    } catch (error) {
      message.error(error.response?.data?.errorMessage || "Có lỗi xảy ra");
    }
  };

  const handleEditAccount = (account) => {
    setIsEditingAccount(true);
    setCurrentAccount(account);
    accountForm.setFieldsValue({
      bankTypeId: account.bankType?.id,
      accountNumber: account.accountNumber,
      accountName: account.accountName
    });
  };

  const handleDeleteAccount = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa tài khoản",
      content: "Bạn có chắc chắn muốn xóa tài khoản này?",
      okText: "Xóa",
      cancelText: "Hủy",
      async onOk() {
        try {
          const accessToken = localStorage.getItem("accessToken");
          await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/user-bank-types/${id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          message.success("Xóa tài khoản thành công");
          fetchUserBankAccounts();
        } catch (error) {
          message.error(error.response?.data?.errorMessage || "Xóa thất bại");
        }
      }
    });
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      message.error('Tải ảnh lên thất bại');
      throw error;
    }
  };

  const handleSubmitFeedback = async (values) => {
    try {
      setUploading(true);

      const imageUrls = await Promise.all(
        fileList.map(file => handleImageUpload(file.originFileObj))
      );

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/${currentWithdrawalId}`,
        {
          title: values.title,
          description: values.description,
          images: imageUrls
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      message.success('Gửi phản hồi thành công!');
      form.resetFields();
      setFileList([]);
      setFeedbackVisible(false);
      fetchComplaints();
    } catch (error) {
      message.error({
        content: `${error.response?.data?.errorMessage || 'Gửi phản hồi thất bại'}`,
        style: {
          zIndex: 100002,
          position: 'relative',
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    Modal.confirm({
      title: 'Xác nhận xóa phản hồi',
      content: 'Bạn có chắc chắn muốn xóa phản hồi này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/${complaintId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          );

          message.success('Đã xóa phản hồi thành công');
          fetchComplaints(complaintPagination.current, complaintPagination.pageSize);
        } catch (error) {
          message.error(error.response?.data?.errorMessage || 'Xóa phản hồi thất bại');
        }
      }
    });
  };

  const handleEditComplaintInfo = async (values) => {
    try {
      setUploading(true);
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1`,
        {
          id: currentComplaint.id,
          title: values.title,
          description: values.description
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      message.success('Cập nhật thông tin thành công!');
      setEditInfoVisible(false);
      setEditImagesVisible(true);
    } catch (error) {
      message.error(error.response?.data?.errorMessage || 'Cập nhật thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateComplaintImages = async (fileList) => {
    try {
      setUploading(true);

      // Add new images
      const newImages = fileList
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj);
      console.log("newImage", newImages)
      const uploadedUrls = await Promise.all(
        newImages.map(file => handleImageUpload(file))
      );
      console.log("upload url", uploadedUrls)

      await Promise.all(
        uploadedUrls.map(url =>
          axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/${currentComplaint.id}/image`,
            null,
            {
              params: { image: url },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          )
        )
      );

      // Remove deleted images
      const originalIds = currentComplaint.complaintImages.map(img => img.id);
      const currentIds = fileList.map(file => file.uid);
      const deletedIds = originalIds.filter(id => !currentIds.includes(id));

      await Promise.all(
        deletedIds.map(id =>
          axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/${currentComplaint.id}/image`,
            {
              params: { withdrawalComplaintImageId: id },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          )
        )
      );

      message.success('Cập nhật ảnh thành công!');
      setEditImagesVisible(false);
      fetchComplaints();
    } catch (error) {
      message.error(error.response?.data?.errorMessage || 'Cập nhật ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  // Render functions
  const transactionColumns = [
    {
      title: "Thời gian",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 150,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdTime) - new Date(b.createdTime),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      width: 160,
      render: (type) => (
        <Space>
          {transactionTypeMap[type]?.icon || <WalletOutlined />}
          {transactionTypeMap[type]?.text || "Không rõ"}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: "Mã giao dịch",
    //   dataIndex: "transactionCode",
    //   key: "transactionCode",
    //   width: 180,
    // },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (amount, record) => {
        const sign = record.isAddToWallet != null
          ? (record.isAddToWallet ? "+" : "-")
          : "";
        return `${sign}₫${amount?.toLocaleString()}`;
      },
    },
    {
      title: "Số dư",
      dataIndex: "balance",
      key: "balance",
      width: 140,
      render: (balance) => `₫${balance?.toLocaleString()}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const statusInfo = transactionStatusMap[status] || {
          text: "Không xác định",
          color: "default"
        };
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.icon}
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setTransactionDetailModalVisible(true);
            fetchTransactionDetail(record.id);
          }}
        >
          Chi tiết
        </Button>
      ),
    }
  ];


  const complaintColumns = [
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusInfo = complaintStatusMap[status] || {
          text: "Không xác định",
          color: "default"
        };
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.icon}
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0
        }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: `Chi tiết phản hồi #${record.id}`,
                width: 800,
                content: (
                  <div>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Tiêu đề">
                        {record.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mô tả">
                        {record.description}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phản hồi từ hệ thống">
                        {record.resolveDescription || "Chưa có phản hồi"}
                      </Descriptions.Item>
                    </Descriptions>

                    <Collapse ghost defaultActiveKey={[]}>
                      {record.complaintImages?.length > 0 && (
                        <Collapse.Panel
                          header={`Ảnh đính kèm (${record.complaintImages.length})`}
                          key="1"
                        >
                          <Image.PreviewGroup>
                            <Row gutter={[16, 16]}>
                              {record.complaintImages?.map((img, idx) => (
                                <Col span={8} key={`complaint-${idx}`}>
                                  <Image
                                    src={img.image}
                                    style={{
                                      borderRadius: 8,
                                      border: '1px solid #f0f0f0',
                                      padding: 4
                                    }}
                                    alt={`Ảnh phản hồi ${idx + 1}`}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Image.PreviewGroup>
                        </Collapse.Panel>
                      )}

                      {record.resolveImages?.length > 0 && (
                        <Collapse.Panel
                          header={`Ảnh giải quyết (${record.resolveImages.length})`}
                          key="2"
                        >
                          <Image.PreviewGroup>
                            <Row gutter={[16, 16]}>
                              {record.resolveImages?.map((img, idx) => (
                                <Col span={8} key={`resolve-${idx}`}>
                                  <Image
                                    src={img.image}
                                    style={{
                                      borderRadius: 8,
                                      border: '1px solid #f0f0f0',
                                      padding: 4
                                    }}
                                    alt={`Ảnh phản hồi hệ thống ${idx + 1}`}
                                  />
                                  <div style={{ textAlign: 'center', marginTop: 4 }}>
                                    <Tag color="blue">Phản hồi từ hệ thống</Tag>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </Image.PreviewGroup>
                        </Collapse.Panel>
                      )}
                    </Collapse>
                  </div>
                ),
              });
            }}
          >
            Xem chi tiết
          </Button>
          {record.status === 3 && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentComplaint(record);
                setEditInfoVisible(true);
                setEditStep(1);
              }}
            >
              Chỉnh sửa
            </Button>
          )}
          {record.status === 3 && (
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteComplaint(record.id)}
              danger
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const accountColumns = [
    {
      title: "Ngân hàng",
      dataIndex: ["bankType", "id"],
      key: "bankType",
      render: (id, record) => {
        const bank = record.bankType || bankTypes.find(b => b.id === id);
        return bank ? (
          <Space>
            {bank.imageIcon && (
              <img
                src={bank.imageIcon}
                alt={bank.bankName}
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            )}
            {bank.bankCode}
          </Space>
        ) : "Không xác định";
      }
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNumber",
      key: "accountNumber"
    },
    {
      title: "Tên chủ tài khoản",
      dataIndex: "accountName",
      key: "accountName"
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditAccount(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAccount(record.id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  // Modal components
  const FeedbackModal = () => (
    <Modal
      title="Phản hồi về giao dịch rút tiền"
      visible={feedbackVisible}
      onCancel={() => setFeedbackVisible(false)}
      footer={null}
      zIndex={2000}
      width={600}
    >
      <Form form={form} onFinish={handleSubmitFeedback} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề phản hồi"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề phản hồi" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea rows={4} placeholder="Mô tả vấn đề bạn gặp phải" />
        </Form.Item>

        <Form.Item
          label="Ảnh minh chứng"
          extra="Hãy tải ảnh về vấn đề bạn đang gặp và cần giải quyết (định dạng JPG, PNG)"
        >
          <Upload
            multiple
            maxCount={5}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            accept="image/png, image/jpeg"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            style={{ float: 'right' }}
          >
            Gửi phản hồi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  const EditInfoModal = () => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (currentComplaint) {
        form.setFieldsValue({
          title: currentComplaint.title,
          description: currentComplaint.description
        });
      }
    }, [currentComplaint]);

    return (
      <Modal
        title="Chỉnh sửa thông tin phản hồi (Bước 1/2)"
        visible={editInfoVisible}
        onCancel={() => setEditInfoVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleEditComplaintInfo} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề phản hồi"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              style={{ float: 'right' }}
            >
              Lưu và tiếp tục
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const EditImagesModal = () => {
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
      if (currentComplaint) {
        setFileList(currentComplaint.complaintImages.map(img => ({
          uid: img.id,
          name: `image_${img.id}`,
          status: 'done',
          url: img.image
        })));
      }
    }, [currentComplaint]);

    return (
      <Modal
        title="Quản lý ảnh đính kèm (Bước 2/2)"
        visible={editImagesVisible}
        onCancel={() => setEditImagesVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEditImagesVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={() => handleUpdateComplaintImages(fileList)}
          >
            Lưu thay đổi
          </Button>,
        ]}
        width={800}
      >
        <Upload
          multiple
          maxCount={5}
          fileList={fileList}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          beforeUpload={() => false}
          accept="image/png, image/jpeg"
          onRemove={(file) => {
            setFileList(fileList.filter(f => f.uid !== file.uid));
            return true;
          }}
        >
          <Button icon={<UploadOutlined />}>Thêm ảnh mới</Button>
        </Upload>
        <Divider />

        <Text strong>Ảnh hiện tại:</Text>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {fileList.map(file => (
            <Col span={6} key={file.uid}>
              <Image
                src={file.url}
                style={{
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                  padding: 4
                }}
              />
            </Col>
          ))}
        </Row>
      </Modal>
    );
  };

  const AccountSettingModal = () => (
    <Modal
      title="Quản lý tài khoản rút tiền"
      visible={accountSettingModalVisible}
      onCancel={() => {
        setAccountSettingModalVisible(false);
        setIsEditingAccount(false);
        accountForm.resetFields();
      }}
      footer={null}
      width={800}
    >
      <Spin spinning={loadingUserAccounts}>
        <Table
          dataSource={userBankAccounts}
          columns={accountColumns}
          rowKey="id"
          pagination={false}
          scroll={{ y: 300 }}
          bordered
        />

        <Divider orientation="center">
          {isEditingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
        </Divider>

        <Form form={accountForm} onFinish={handleAccountSubmit} layout="vertical">
          <Form.Item
            name="bankTypeId"
            label="Ngân hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select
              placeholder="Chọn ngân hàng"
              loading={bankTypesLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {bankTypes.map(bank => (
                <Select.Option key={bank.id} value={bank.id}>
                  <Space style={{ display: "flex", alignItems: "center" }}>
                    {bank.imageIcon && (
                      <img
                        src={bank.imageIcon}
                        alt={bank.bankCode}
                        style={{ width: 18, height: 18, objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <div>{bank.bankCode}</div>
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản" },
              { pattern: /^\d+$/, message: "Số tài khoản chỉ được chứa số" },
              { min: 8, message: "Tối thiểu 8 ký tự" },
              { max: 20, message: "Tối đa 20 ký tự" }
            ]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Tên chủ tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
              {
                pattern: /^[a-zA-Z\sÀ-ỹ]+$/,
                message: "Tên chỉ được chứa chữ cái và dấu cách"
              }
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                {isEditingAccount ? "Cập nhật" : "Thêm mới"}
              </Button>
              {isEditingAccount && (
                <Button onClick={() => {
                  setIsEditingAccount(false);
                  accountForm.resetFields();
                }}>Hủy bỏ</Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );

  const AccountSelectionModal = () => (
    <Modal
      title="Chọn tài khoản rút tiền"
      visible={accountSelectionVisible}
      onCancel={() => setAccountSelectionVisible(false)}
      footer={null}
      width={600}
    >
      <List
        itemLayout="horizontal"
        dataSource={[...userBankAccounts, { id: 'other', bankType: { bankCode: 'Khác' } }]}
        renderItem={(account) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                onClick={() => {
                  if (account.id === 'other') {
                    setSelectedBankAccount(null);
                    withdrawForm.resetFields();
                  } else {
                    setSelectedBankAccount(account);
                    withdrawForm.setFieldsValue({
                      bankType: account.bankType.id,
                      accountNumber: account.accountNumber,
                      accountName: account.accountName
                    });
                  }
                  setAccountSelectionVisible(false);
                  setWithdrawModalVisible(true);
                }}
              >
                Chọn
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={account.id !== 'other' && account.bankType?.imageIcon && (
                <img
                  src={account.bankType.imageIcon}
                  alt={account.bankType.bankCode}
                  style={{ width: 32, height: 32 }}
                />
              )}
              title={account.id === 'other' ? 'Khác' : account.bankType?.bankCode}
              description={account.id === 'other'
                ? "Nhập thông tin tài khoản mới"
                : `${account.accountName} - ${account.accountNumber}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  );

  const TransactionDetailModal = () => {
    const renderOrderDetails = (order) => {
      if (!order) return null;

      return (
        <>
          <Descriptions.Item label="Thông tin đơn hàng">
            <Space direction="vertical">
              <div>
                <Text strong>Mã đơn hàng: </Text>
                {order.orderCode || 'N/A'}
              </div>
              <div>
                <Text strong>Loại đơn hàng: </Text>
                {order.type === 1 ? 'Mua thơ' :
                  order.type === 2 ? 'Mua template' :
                    order.type === 3 ? 'Mua file ghi âm' : 'Khác'}
              </div>
              <div>
                <Text strong>Trạng thái: </Text>
                <Tag color={
                  order.status === 1 ? 'orange' :
                    order.status === 2 ? 'green' :
                      order.status === 3 ? 'red' : 'default'
                }>
                  {order.status === 1 ? 'Chờ xử lý' :
                    order.status === 2 ? 'Hoàn thành' :
                      order.status === 3 ? 'Đã hủy' : 'Không xác định'}
                </Tag>
              </div>
              <div>
                <Text strong>Mô tả: </Text>
                {order.orderDescription || 'Không có mô tả'}
              </div>
              <div>
                <Text strong>Tổng tiền: </Text>
                ₫{order.amount?.toLocaleString() || '0'}
              </div>
            </Space>
          </Descriptions.Item>

          {/* Order Details */}
          {order.orderDetails?.map((detail, index) => (
            <Descriptions.Item key={index} label={`Chi tiết sản phẩm ${index + 1}`}>
              <Space direction="vertical">
                <div>
                  <Text strong>Giá đơn vị: </Text>
                  ₫{detail.itemPrice?.toLocaleString() || '0'}
                </div>
                <div>
                  <Text strong>Số lượng: </Text>
                  {detail.itemQuantity || '1'}
                </div>
                <div>
                  <Text strong>Thành tiền: </Text>
                  ₫{(detail.itemPrice * (detail.itemQuantity || 1))?.toLocaleString() || '0'}
                </div>

                {/* Template Details */}
                {detail.masterTemplate && (
                  <>
                    <div>
                      <Text strong>Tên template: </Text>
                      {detail.masterTemplate.templateName || 'N/A'}
                    </div>
                  </>
                )}

                {/* Sale Version Details */}
                {detail.saleVersion && (
                  <>
                    <div>
                      <Text strong>Tên thơ: </Text>
                      {detail.saleVersion.poem?.title || 'N/A'}
                    </div>
                    <div>
                      <Text strong>Giá: </Text>
                      ₫{detail.saleVersion.price?.toLocaleString() || '0'}
                    </div>
                    <div>
                      <Text strong>Thời lượng: </Text>
                      {detail.saleVersion.durationTime || '0'} phút
                    </div>
                    <div>
                      <Text strong>Hoa hồng: </Text>
                      {detail.saleVersion.commissionPercentage || '0'}%
                    </div>
                  </>
                )}

                {/* Record File Details */}
                {detail.recordFile && (
                  <>
                    <div>
                      <Text strong>Tên file: </Text>
                      {detail.recordFile.fileName || 'N/A'}
                    </div>
                  </>
                )}
              </Space>
            </Descriptions.Item>
          ))}
        </>
      );
    };

    return (
      <Modal
        title="Chi tiết giao dịch"
        visible={transactionDetailModalVisible}
        onCancel={() => {
          setTransactionDetailModalVisible(false);
          setTransactionDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setTransactionDetailModalVisible(false);
            setTransactionDetail(null);
          }}>
            Đóng
          </Button>,
          (transactionDetail?.type === 5 && (transactionDetail?.status === 4 || transactionDetail?.status === 5)) || (transactionDetail?.type === 8 && (transactionDetail?.status === 4 || transactionDetail?.status === 5)) ?
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => {
                setCurrentWithdrawalId(transactionDetail?.withdrawalForm?.id);
                setFeedbackVisible(true);
              }}
            >
              Phản hồi
            </Button>
            : <></>
        ]}
        width={800}
      >
        <Spin spinning={transactionDetailLoading}>
          {transactionDetail ? (
            <Descriptions bordered column={1}>
              {/* Basic Transaction Info */}
              <Descriptions.Item label="Mã giao dịch">
                <Text strong>{transactionDetail.transactionCode || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại giao dịch">
                <Space>
                  {transactionTypeMap[transactionDetail.type]?.icon || <WalletOutlined />}
                  {transactionTypeMap[transactionDetail.type]?.text || "Không rõ"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{transactionDetail.description || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={transactionStatusMap[transactionDetail.status]?.color || "default"}>
                  {transactionStatusMap[transactionDetail.status]?.icon}
                  {transactionStatusMap[transactionDetail.status]?.text || "Không xác định"}
                </Tag>
              </Descriptions.Item>

              {/* Amount Information */}
              <Descriptions.Item label="Số tiền">
                <Text strong type={transactionDetail.isAddToWallet ? "success" : "danger"}>
                  {transactionDetail.isAddToWallet != null
                    ? (transactionDetail.isAddToWallet ? "+" : "-")
                    : ""}₫{transactionDetail.amount?.toLocaleString() || '0'}
                </Text>
              </Descriptions.Item>
              {transactionDetail.discountAmount > 0 && (
                <Descriptions.Item label="Giảm giá">
                  ₫{transactionDetail.discountAmount?.toLocaleString() || '0'}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Số dư sau giao dịch">
                ₫{transactionDetail.balance?.toLocaleString() || '0'}
              </Descriptions.Item>

              {/* Timeline Information */}
              <Descriptions.Item label="Thời gian tạo">
                {dayjs(transactionDetail.createdTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {transactionDetail.paidDate && (
                <Descriptions.Item label="Thời gian thanh toán">
                  {dayjs(transactionDetail.paidDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              {transactionDetail.cancelledDate && (
                <Descriptions.Item label="Thời gian hủy">
                  {dayjs(transactionDetail.cancelledDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}

              {/* User Information */}
              {transactionDetail.user && (
                <Descriptions.Item label="Người gửi">
                  <Space>
                    {transactionDetail.user.avatar && (
                      <Image
                        src={transactionDetail.user.avatar}
                        width={50}
                        height={50}
                        preview={false}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div>
                      <div>{transactionDetail.user.displayName || transactionDetail.user.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {transactionDetail.user.email || transactionDetail.user.phoneNumber || 'N/A'}
                      </div>
                    </div>
                  </Space>
                </Descriptions.Item>
              )}

              {transactionDetail.receiveUser && (
                <Descriptions.Item label="Người nhận">
                  <Space>
                    {transactionDetail.receiveUser.avatar && (
                      <Image
                        src={transactionDetail.receiveUser.avatar}
                        width={50}
                        height={50}
                        preview={false}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div>
                      <div>{transactionDetail.receiveUser.displayName || transactionDetail.receiveUser.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {transactionDetail.receiveUser.email || transactionDetail.receiveUser.phoneNumber || 'N/A'}
                      </div>
                    </div>
                  </Space>
                </Descriptions.Item>
              )}

              {/* Payment Gateway */}
              {transactionDetail.paymentGateway && (
                <Descriptions.Item label="Cổng thanh toán">
                  <Space>
                    {transactionDetail.paymentGateway.imageIcon && (
                      <Image
                        src={transactionDetail.paymentGateway.imageIcon}
                        width={30}
                        preview={false}
                      />
                    )}
                    <div>
                      {transactionDetail.paymentGateway.name}
                      {transactionDetail.paymentGateway.isSuspended && (
                        <Tag color="error" style={{ marginLeft: 8 }}>Đã ngừng hoạt động</Tag>
                      )}
                    </div>
                  </Space>
                </Descriptions.Item>
              )}

              {/* Order Information */}
              {renderOrderDetails(transactionDetail.order)}

              {/* Withdrawal Information */}
              {transactionDetail.withdrawalForm && (
                <>
                  <Descriptions.Item label="Thông tin rút tiền">
                    <Space direction="vertical">
                      <div>
                        <Text strong>Số tiền: </Text>
                        ₫{transactionDetail.withdrawalForm.amount?.toLocaleString() || '0'}
                      </div>
                      <div>
                        <Text strong>Trạng thái: </Text>
                        {getWithdrawalFormStatus(transactionDetail.withdrawalForm.status)}
                      </div>
                      <div>
                        <Text strong>Mô tả: </Text>
                        {transactionDetail.withdrawalForm.description || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Ngày tạo: </Text>
                        {dayjs(transactionDetail.withdrawalForm.createdTime).format("DD/MM/YYYY HH:mm")}
                      </div>
                      <br />
                      {transactionDetail.withdrawalForm.accountName && (
                        <div>
                          <Text strong>Chủ tài khoản: </Text>
                          {transactionDetail.withdrawalForm.accountName}
                        </div>
                      )}
                      {transactionDetail.withdrawalForm.accountNumber && (
                        <div>
                          <Text strong>Số tài khoản: </Text>
                          {transactionDetail.withdrawalForm.accountNumber}
                        </div>
                      )}
                      {transactionDetail.withdrawalForm.resolveDescription && (
                        <div>
                          <Text strong>Phản hồi giải quyết: </Text>
                          {transactionDetail.withdrawalForm.resolveDescription}
                        </div>
                      )}
                      {transactionDetail.withdrawalForm.resolveEvidence && (
                        <div>
                          <Text strong>Hình ảnh chuyển khoản:</Text>
                          <span
                            style={{ marginLeft: 8, cursor: 'pointer' }}
                            onClick={() => setShowEvidence(!showEvidence)}
                          >
                            {showEvidence ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </span>

                          {showEvidence && (
                            <div style={{ marginTop: 8 }}>
                              <img
                                src={transactionDetail.withdrawalForm.resolveEvidence}
                                alt="Hình ảnh chuyển khoản"
                                style={{ maxWidth: "50%", borderRadius: 4 }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </Space>
                  </Descriptions.Item>

                  {/* Bank Information */}
                  {transactionDetail.withdrawalForm.bankType && (
                    <Descriptions.Item label="Ngân hàng">
                      <Space>
                        {transactionDetail.withdrawalForm.bankType.imageIcon && (
                          <Image
                            src={transactionDetail.withdrawalForm.bankType.imageIcon}
                            width={30}
                            preview={false}
                          />
                        )}
                        <div>
                          {transactionDetail.withdrawalForm.bankType.bankName}
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {transactionDetail.withdrawalForm.bankType.bankCode}
                          </div>
                        </div>
                      </Space>
                    </Descriptions.Item>
                  )}

                  {/* User Bank Account */}
                  {transactionDetail.withdrawalForm.userBankType && (
                    <Descriptions.Item label="Tài khoản ngân hàng">
                      <Space direction="vertical">
                        <div>
                          <Text strong>Tên tài khoản: </Text>
                          {transactionDetail.withdrawalForm.userBankType.accountName}
                        </div>
                        <div>
                          <Text strong>Số tài khoản: </Text>
                          {transactionDetail.withdrawalForm.userBankType.accountNumber}
                        </div>
                      </Space>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          ) : (
            <div>Không tìm thấy thông tin giao dịch</div>
          )}
        </Spin>
      </Modal>
    );
  };

  const exampleAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  const dataSource = exampleAmounts.map(amount => ({
    key: amount,
    amount: amount.toLocaleString(),
    fee: inUseFee,
    received: Math.floor(amount * (1 - inUseFee / 100)).toLocaleString()
  }));

  const columns = [
    {
      title: 'Tiền Nạp (VNĐ)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right'
    },
    {
      title: 'Phí dịch vụ (%)',
      dataIndex: 'fee',
      key: 'fee',
      align: 'center'
    },
    {
      title: 'Tiền nhận được (VNĐ)',
      dataIndex: 'received',
      key: 'received',
      align: 'right'
    }
  ];

  // Effects
  useEffect(() => {
    if (depositModalVisible) {
      const fetchCommissionFee = async () => {
        try {
          setLoadingFee(true);
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/deposit-commission-settings/v1/in-use`
          );
          setInUseFee(response.data.data.amountPercentage);
        } catch (error) {
          message.error('Không thể tải thông tin phí dịch vụ');
        } finally {
          setLoadingFee(false);
        }
      };
      fetchCommissionFee();
    }
  }, [depositModalVisible]);

  useEffect(() => {
    if (accountSettingModalVisible || accountSelectionVisible) {
      fetchUserBankAccounts();
    }
  }, [accountSettingModalVisible, accountSelectionVisible]);

  useEffect(() => {
    fetchWalletInfo();
    fetchTransactions();
    fetchPaymentMethods();
    fetchComplaints();
    fetchBankTypes();
  }, []);

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
              <Button
                type="primary"
                icon={<KeyOutlined />}
                size="large"
                onClick={handleAccountSetting}
                style={{ marginTop: 16 }}
              >
                Thiết lập tài khoản rút tiền
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Tabs defaultActiveKey="1">
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
            loading={transactionsLoading}
            pagination={{
              ...transactionsPagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            style={{
              overflow: "scroll"
            }}
            onChange={handleTransactionsTableChange}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <MessageOutlined />
              Phản hồi rút tiền
            </span>
          }
          key="2"
        >
          <Table
            columns={complaintColumns}
            dataSource={complaints}
            rowKey="id"
            loading={complaintLoading}
            pagination={{
              ...complaintPagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
            onChange={(pagination) => {
              setComplaintPagination(pagination);
              fetchComplaints(pagination.current, pagination.pageSize);
            }}
          />
        </Tabs.TabPane>
      </Tabs>

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
        <Typography.Text type="" style={{ display: 'block', fontSize: 13, marginBottom: 10 }}>
          Ghi chú: Khi nạp tiền, hệ thống sẽ thu phí dịch vụ là <span style={{ color: "#5cb85c", fontWeight: "bold" }}>{loadingFee ?
            <Skeleton.Input active size="small" style={{ width: 30 }} />
            : inUseFee}%</span>.{' '}
          <a onClick={() => setExampleVisible(true)}>Xem thêm</a>
        </Typography.Text>
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
              max={1000000000}
              step={10000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₫\s?|(,*)/g, '')}
              onChange={(value) => {
                if (value > 1000000000) {
                  depositForm.setFieldsValue({ amount: 1000000000 });
                }
              }}
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

      {/* Modal ví dụ phí dịch vụ */}
      <Modal
        title="Ví dụ tính phí dịch vụ"
        visible={exampleVisible}
        onCancel={() => setExampleVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="small"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Typography.Text type="secondary">
                  Công thức tính: Tiền nhận được = Tiền nạp × (1 - {inUseFee}%)
                </Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Modal>

      {/* Modal rút tiền */}
      <Modal
        title="Rút tiền từ ví"
        visible={withdrawModalVisible}
        onOk={handleWithdrawSubmit}
        confirmLoading={withdrawConfirmLoading}
        onCancel={() => {
          setWithdrawModalVisible(false);
          setSelectedBankAccount(null);
        }}
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
                min: 1000,
                max: walletBalance,
                message: `Số tiền tối thiểu phải từ 1,000 VNĐ`,
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1000}
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
            <Select
              placeholder="Chọn ngân hàng"
              loading={bankTypesLoading}
              disabled={!!selectedBankAccount}
            >
              {bankTypes.map(bank => (
                <Option key={bank.id} value={bank.id}>
                  <Space>
                    {bank.imageIcon && (
                      <img
                        src={bank.imageIcon}
                        alt={bank.bankCode}
                        style={{
                          width: 20,
                          height: 20,
                          objectFit: 'contain'
                        }}
                      />
                    )}
                    {bank.bankCode}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[
              { required: !selectedBankAccount, message: "Vui lòng nhập số tài khoản" },
              { pattern: /^[0-9]+$/, message: "Số tài khoản chỉ được chứa số" },
              { min: 8, message: "Số tài khoản tối thiểu 8 ký tự" },
              { max: 20, message: "Số tài khoản tối đa 20 ký tự" },
            ]}
          >
            <Input
              placeholder="Nhập số tài khoản ngân hàng"
              disabled={!!selectedBankAccount}
            />
          </Form.Item>

          <Form.Item
            name="accountName"
            label="Tên chủ tài khoản"
            rules={[
              { required: !selectedBankAccount, message: "Vui lòng nhập tên chủ tài khoản" },
              { pattern: /^[a-zA-Z\sÀ-ỹ]+$/, message: "Tên chỉ được chứa chữ cái và dấu cách" },
            ]}
          >
            <Input
              placeholder="Nhập tên chủ tài khoản "
              disabled={!!selectedBankAccount}
            />
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

      {/* Các modal khác */}
      <FeedbackModal />
      <EditInfoModal />
      <EditImagesModal />
      <AccountSettingModal />
      <AccountSelectionModal />
      <TransactionDetailModal />
    </div>
  );
};

export default YourWallet;