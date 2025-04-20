import React from 'react';
import axios from 'axios';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Button,
  Image,
  Row,
  Col,
  Typography,
  message
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditPoetForm = ({ 
  poet, 
  onCancel, 
  onSubmit, 
  titleSamples, 
  titleSamplesLoading,
  loading 
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const [previewImage, setPreviewImage] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  // Initialize form values
  React.useEffect(() => {
    if (poet) {
      const formattedDate = poet.dateOfBirth ? dayjs(poet.dateOfBirth) : null;
      form.setFieldsValue({
        name: poet.name,
        bio: poet.bio,
        dateOfBirth: formattedDate,
        gender: poet.gender,
        avatar: poet.avatar || '',
        titleSampleIds: poet.titleSamples?.map(sample => sample.id) || []
      });
      setPreviewImage(poet.avatar || '');
    }
  }, [poet, form]);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.statusCode === 201) {
        message.success('Upload ảnh thành công!');
        setPreviewImage(response.data.data);
        form.setFieldsValue({ avatar: response.data.data });
        return false;
      } else {
        message.error(response.data.message || 'Upload ảnh thất bại');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      message.error(error.response?.data?.message || 'Lỗi khi upload ảnh');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage('');
      form.setFieldsValue({ avatar: '' });
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể tải lên file ảnh!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      setFileList([file]);
      handleUpload(file);
      return false;
    },
    fileList,
    maxCount: 1,
    accept: 'image/*',
    listType: 'picture',
    showUploadList: false
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedDate = values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null;

      const requestBody = {
        id: poet.id,
        name: values.name,
        bio: values.bio,
        dateOfBirth: formattedDate,
        gender: values.gender,
        avatar: values.avatar || '',
        titleSampleIds: values.titleSampleIds || []
      };

      await onSubmit(requestBody);
    } catch (error) {
      console.error('Lỗi khi validate form:', error);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={<Text strong>Tên nhà thơ</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhà thơ!' },
              { max: 100, message: 'Tên không được vượt quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên nhà thơ" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="gender"
            label={<Text strong>Giới tính</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select placeholder="Chọn giới tính" size="large">
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="dateOfBirth"
        label={<Text strong>Ngày sinh</Text>}
        rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          size="large"
          disabledDate={current => current && current > dayjs()}
        />
      </Form.Item>

      <Form.Item
        name="bio"
        label={<Text strong>Tiểu sử</Text>}
        rules={[
          { required: true, message: 'Vui lòng nhập tiểu sử!' },
          { max: 1000, message: 'Tiểu sử không được vượt quá 1000 ký tự' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập tiểu sử nhà thơ..."
          showCount
          maxLength={1000}
          style={{ resize: 'none' }}
        />
      </Form.Item>

      <Form.Item
        name="titleSampleIds"
        label={<Text strong>Chuyên môn thơ</Text>}
        extra={<Text type="secondary">Chọn các chuyên môn thơ của nhà thơ</Text>}
      >
        <Select
          mode="multiple"
          placeholder="Chọn chuyên môn thơ"
          size="large"
          loading={titleSamplesLoading}
          optionFilterProp="label"
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {titleSamples.map(sample => (
            <Option 
              key={sample.id} 
              value={sample.id}
              label={sample.name}
            >
              {sample.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="avatar"
        label={<Text strong>Ảnh đại diện</Text>}
        extra={<Text type="secondary">Tải lên ảnh đại diện (tối đa 5MB, định dạng JPG/PNG)</Text>}
      >
        <div>
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={uploading}
              size="large"
              block
            >
              {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
            </Button>
          </Upload>

          {(previewImage || form.getFieldValue('avatar')) && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Image
                src={previewImage || form.getFieldValue('avatar')}
                alt="Ảnh đại diện"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  border: '1px dashed #d9d9d9'
                }}
              />
            </div>
          )}
        </div>
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Button onClick={onCancel} style={{ marginRight: '8px' }}>
          Hủy bỏ
        </Button>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          Cập nhật
        </Button>
      </div>
    </Form>
  );
};

export default EditPoetForm;