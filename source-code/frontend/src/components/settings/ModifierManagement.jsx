import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Tag,
  Popconfirm,
  message,
  Space,
  Select,
  Drawer,
  List,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  loadModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  createModifier,
  updateModifier,
  deleteModifier,
} from "../../redux/rtk/features/modifiers/modifiersSlice";
import { loadProduct } from "../../redux/rtk/features/product/productSlice";
import useCurrency from "../../utils/useCurrency";
import UserPrivateComponent from "../PrivacyComponent/UserPrivateComponent";

export default function ModifierManagement() {
  const dispatch = useDispatch();
  const currency = useCurrency();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingModifier, setEditingModifier] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupForm] = Form.useForm();
  const [modifierForm] = Form.useForm();

  const { groups, loading } = useSelector((state) => state.modifiers || { groups: [], loading: false });
  const { list: products } = useSelector((state) => state.products || { list: [] });

  useEffect(() => {
    dispatch(loadModifierGroups());
    dispatch(loadProduct({ page: 1, count: 100, status: "true" }));
  }, [dispatch]);

  // Group Handlers
  const handleCreateGroup = async (values) => {
    const action = editingGroup
      ? updateModifierGroup({ id: editingGroup.id, values })
      : createModifierGroup(values);
    
    const result = await dispatch(action);
    if (result.payload?.message === "success") {
      setGroupModalOpen(false);
      groupForm.resetFields();
      setEditingGroup(null);
      dispatch(loadModifierGroups());
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    groupForm.setFieldsValue({
      name: group.name,
      description: group.description,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      isRequired: group.isRequired,
    });
    setGroupModalOpen(true);
  };

  const handleDeleteGroup = async (id) => {
    await dispatch(deleteModifierGroup(id));
    dispatch(loadModifierGroups());
  };

  // Modifier Handlers
  const handleCreateModifier = async (values) => {
    if (!selectedGroup) return;
    
    const action = editingModifier
      ? updateModifier({ id: editingModifier.id, values: { ...values, groupId: selectedGroup.id } })
      : createModifier({ ...values, groupId: selectedGroup.id });
    
    const result = await dispatch(action);
    if (result.payload?.message === "success") {
      setModifierModalOpen(false);
      modifierForm.resetFields();
      setEditingModifier(null);
      dispatch(loadModifierGroups());
    }
  };

  const handleEditModifier = (modifier, group) => {
    setSelectedGroup(group);
    setEditingModifier(modifier);
    modifierForm.setFieldsValue({
      name: modifier.name,
      price: modifier.price,
      isDefault: modifier.isDefault,
      isActive: modifier.isActive,
    });
    setModifierModalOpen(true);
  };

  const handleDeleteModifier = async (id) => {
    await dispatch(deleteModifier(id));
    dispatch(loadModifierGroups());
  };

  const handleAssignProducts = (group) => {
    setSelectedGroup(group);
    setAssignDrawerOpen(true);
  };

  const groupColumns = [
    {
      title: "Group Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Selection Rules",
      key: "rules",
      render: (_, record) => (
        <span>
          {record.isRequired && <Tag color="red">Required</Tag>}
          <Tag color="blue">
            Min: {record.minSelection} / Max: {record.maxSelection}
          </Tag>
        </span>
      ),
    },
    {
      title: "Modifiers",
      key: "modifiers",
      render: (_, record) => (
        <span>{record.modifiers?.length || 0} items</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => {
              setSelectedGroup(record);
              setEditingModifier(null);
              modifierForm.resetFields();
              setModifierModalOpen(true);
            }}
          >
            Add Item
          </Button>
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => handleAssignProducts(record)}
          >
            Assign Products
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditGroup(record)}
          />
          <Popconfirm
            title="Delete this group?"
            onConfirm={() => handleDeleteGroup(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const columns = [
      { title: "Modifier Name", dataIndex: "name", key: "name" },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (price) => `₱${Number(price).toFixed(2)}`,
      },
      {
        title: "Default",
        dataIndex: "isDefault",
        key: "isDefault",
        render: (val) => val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (val) => val ? <Tag color="blue">Active</Tag> : <Tag color="red">Inactive</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, modifier) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditModifier(modifier, record)}
            />
            <Popconfirm
              title="Delete this modifier?"
              onConfirm={() => handleDeleteModifier(modifier.id)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.modifiers || []}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  return (
    <UserPrivateComponent permission="create-product">
      <Card
        title="Item Modifiers & Add-ons"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGroup(null);
              groupForm.resetFields();
              setGroupModalOpen(true);
            }}
          >
            New Modifier Group
          </Button>
        }
      >
        <Table
          columns={groupColumns}
          dataSource={groups || []}
          loading={loading}
          rowKey="id"
          expandable={{ expandedRowRender }}
        />

        {/* Group Modal */}
        <Modal
          title={editingGroup ? "Edit Modifier Group" : "Create Modifier Group"}
          open={groupModalOpen}
          onCancel={() => {
            setGroupModalOpen(false);
            setEditingGroup(null);
            groupForm.resetFields();
          }}
          footer={null}
        >
          <Form form={groupForm} onFinish={handleCreateGroup} layout="vertical">
            <Form.Item
              name="name"
              label="Group Name"
              rules={[{ required: true, message: "Enter group name" }]}
            >
              <Input placeholder="e.g., Size, Toppings, Drinks" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea placeholder="Optional description" rows={2} />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="minSelection"
                label="Min Selection"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="maxSelection"
                label="Max Selection"
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <Form.Item
              name="isRequired"
              label="Required Selection"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingGroup ? "Update Group" : "Create Group"}
            </Button>
          </Form>
        </Modal>

        {/* Modifier Modal */}
        <Modal
          title={editingModifier ? "Edit Modifier" : `Add Modifier to ${selectedGroup?.name}`}
          open={modifierModalOpen}
          onCancel={() => {
            setModifierModalOpen(false);
            setEditingModifier(null);
            modifierForm.resetFields();
          }}
          footer={null}
        >
          <Form form={modifierForm} onFinish={handleCreateModifier} layout="vertical">
            <Form.Item
              name="name"
              label="Modifier Name"
              rules={[{ required: true, message: "Enter modifier name" }]}
            >
              <Input placeholder="e.g., Large, Extra Cheese" />
            </Form.Item>
            <Form.Item
              name="price"
              label="Additional Price"
              initialValue={0}
            >
              <InputNumber
                prefix="₱"
                min={0}
                precision={2}
                style={{ width: "100%" }}
                placeholder="0.00"
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="isDefault"
                label="Default Selected"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingModifier ? "Update Modifier" : "Add Modifier"}
            </Button>
          </Form>
        </Modal>

        {/* Assign Products Drawer */}
        <Drawer
          title={`Assign Products to ${selectedGroup?.name}`}
          placement="right"
          width={400}
          onClose={() => setAssignDrawerOpen(false)}
          open={assignDrawerOpen}
        >
          <p className="mb-4 text-gray-500">
            Select products that should show this modifier group
          </p>
          <List
            dataSource={products || []}
            renderItem={(product) => (
              <List.Item>
                <Checkbox
                  checked={selectedGroup?.products?.some(p => p.id === product.id)}
                  onChange={(e) => {
                    // TODO: Implement assign/unassign API call
                    message.info(`${e.target.checked ? 'Assigned' : 'Unassigned'} ${product.name}`);
                  }}
                >
                  {product.name}
                </Checkbox>
              </List.Item>
            )}
          />
        </Drawer>
      </Card>
    </UserPrivateComponent>
  );
}
