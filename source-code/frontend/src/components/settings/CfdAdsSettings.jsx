import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Upload,
  message,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadAllCfdAds,
  createCfdAd,
  updateCfdAd,
  deleteCfdAd,
  toggleCfdAdActive,
} from "../../redux/rtk/features/cfdAds/cfdAdsSlice";

const { TextArea } = Input;
const { Option } = Select;

// Helper to get full media URL
const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const apiUrl = import.meta.env.VITE_APP_API || 'http://127.0.0.1:8000';
  const baseUrl = apiUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '');
  return `${baseUrl}${url}`;
};

const CfdAdsSettings = () => {
  const dispatch = useDispatch();
  const { list: ads, loading } = useSelector((state) => state.cfdAds);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    dispatch(loadAllCfdAds());
  }, [dispatch]);

  const handleOpenModal = (ad = null) => {
    setEditingAd(ad);
    if (ad) {
      form.setFieldsValue({
        title: ad.title,
        subtitle: ad.subtitle,
        badge: ad.badge,
        description: ad.description,
        price: ad.price,
        media_type: ad.media_type,
        duration: ad.duration / 1000, // Convert to seconds for display
        is_active: ad.is_active,
      });
      if (ad.media_url) {
        setFileList([{
          uid: '-1',
          name: 'Current Media',
          status: 'done',
          url: ad.media_url,
        }]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        media_type: 'text',
        duration: 5,
        is_active: true,
      });
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title || '');
    formData.append('subtitle', values.subtitle || '');
    formData.append('badge', values.badge || '');
    formData.append('description', values.description || '');
    formData.append('price', values.price || '');
    formData.append('media_type', values.media_type);
    formData.append('duration', (values.duration || 5) * 1000); // Convert to milliseconds
    formData.append('is_active', values.is_active ? 1 : 0);

    // Handle file - could be originFileObj (from Upload) or direct file (from beforeUpload)
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj || fileList[0];
      if (file instanceof File) {
        formData.append('media_file', file);
      }
    }

    try {
      if (editingAd) {
        await dispatch(updateCfdAd({ id: editingAd.id, formData })).unwrap();
        message.success('Advertisement updated successfully');
      } else {
        await dispatch(createCfdAd(formData)).unwrap();
        message.success('Advertisement created successfully');
      }
      handleCloseModal();
      dispatch(loadAllCfdAds());
    } catch (error) {
      message.error('Failed to save advertisement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCfdAd(id)).unwrap();
      message.success('Advertisement deleted successfully');
    } catch (error) {
      message.error('Failed to delete advertisement');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await dispatch(toggleCfdAdActive(id)).unwrap();
      message.success('Status updated successfully');
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValidType) {
        message.error('You can only upload image or video files!');
        return Upload.LIST_IGNORE;
      }
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('File must be smaller than 50MB!');
        return Upload.LIST_IGNORE;
      }
      // Store with originFileObj for proper FormData handling
      setFileList([{
        uid: file.uid || '-1',
        name: file.name,
        status: 'done',
        originFileObj: file,
      }]);
      return false;
    },
    fileList,
    listType: "picture-card",
    onPreview: handlePreview,
  };

  const columns = [
    {
      title: 'Preview',
      dataIndex: 'media_url',
      key: 'preview',
      width: 120,
      render: (url, record) => {
        const fullUrl = getMediaUrl(url);
        return record.media_type === 'image' && fullUrl ? (
          <Image
            src={fullUrl}
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : record.media_type === 'video' && fullUrl ? (
          <video width={80} height={60} style={{ objectFit: 'cover', borderRadius: 4 }}>
            <source src={fullUrl} />
          </video>
        ) : (
          <div style={{
            width: 80,
            height: 60,
            background: 'linear-gradient(145deg, #c41e3a, #8b0000)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 10,
          }}>
            Text Ad
          </div>
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Badge',
      dataIndex: 'badge',
      key: 'badge',
      render: (badge) => badge && (
        <span style={{
          background: '#ffd700',
          color: '#8b0000',
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {badge}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'media_type',
      key: 'media_type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration / 1000}s`,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete this advertisement?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">CFD Advertisement Settings</span>
            <div className="flex gap-2">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => window.open('/customer-screen', '_blank')}
              >
                Preview Display
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
              >
                Add Advertisement
              </Button>
            </div>
          </div>
        }
      >
        <p className="mb-4 text-gray-600">
          Manage promotional content displayed on the Customer Facing Display (CFD). 
          You can add images, videos, or text-based promotions.
        </p>
        
        <Table
          columns={columns}
          dataSource={ads}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingAd ? "Edit Advertisement" : "Add New Advertisement"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="media_type"
            label="Content Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="text">Text Only (Promo Card)</Option>
              <Option value="image">Image</Option>
              <Option value="video">Video</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.media_type !== currentValues.media_type
            }
          >
            {({ getFieldValue }) =>
              (getFieldValue('media_type') === 'image' ||
                getFieldValue('media_type') === 'video') && (
                <Form.Item
                  label="Upload Media"
                  extra="Max file size: 50MB. Supported formats: JPG, PNG, GIF, MP4, WebM"
                >
                  <Upload {...uploadProps}>
                    {fileList.length < 1 && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="badge"
            label="Badge Text"
            extra="E.g., 'HOLIDAY SPECIAL', 'NEW', 'BEST SELLER'"
          >
            <Input placeholder="HOLIDAY SPECIAL" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
          >
            <Input placeholder="Christmas Treats" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label="Subtitle"
          >
            <Input placeholder="Holiday Joy in Every Cup!" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Iced Vanilla Coffee Float&#10;Iced Mocha Coffee Float"
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price Display"
          >
            <Input placeholder="₱65" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Display Duration (seconds)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={handleCloseModal} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingAd ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CfdAdsSettings;
