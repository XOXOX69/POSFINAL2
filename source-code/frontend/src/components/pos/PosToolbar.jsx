import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Drawer,
  List,
  Tag,
  Badge,
  Switch,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  DollarOutlined,
  BarcodeOutlined,
  WifiOutlined,
  DisconnectOutlined,
  PauseCircleOutlined,
  MoonOutlined,
  SunOutlined,
  PrinterOutlined,
  HistoryOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  getCurrentDrawer,
  openDrawer,
  closeDrawer,
  cashIn,
  cashOut,
} from "../../redux/rtk/features/cashDrawer/cashDrawerSlice";
import {
  setOnlineStatus,
  syncOfflineSales,
} from "../../redux/rtk/features/offline/offlineSlice";
import { loadAllHoldSalePaginated } from "../../redux/rtk/features/holdSale/holdSaleSlice";
import useCurrency from "../../utils/useCurrency";

export default function PosToolbar({ form, totalCalculator, onSelectHoldSale, darkMode, setDarkMode }) {
  const dispatch = useDispatch();
  const currency = useCurrency();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashAction, setCashAction] = useState("in"); // 'in' or 'out'
  const [openDrawerModal, setOpenDrawerModal] = useState(false);
  const [closeDrawerModal, setCloseDrawerModal] = useState(false);
  const [holdSalesDrawer, setHoldSalesDrawer] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef(null);
  const [cashForm] = Form.useForm();
  const [openForm] = Form.useForm();
  const [closeForm] = Form.useForm();

  const { currentDrawer = null, loading = false } = useSelector((state) => state.cashDrawer || {});
  const { isOnline = true, offlineSales = [], syncing = false } = useSelector((state) => state.offline || {});
  const { list: holdSales = [], loading: holdLoading = false } = useSelector((state) => state.holdSale || {});

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineSales.length > 0) {
      dispatch(syncOfflineSales());
    }
  }, [isOnline, offlineSales.length, dispatch]);

  // Load current drawer on mount
  useEffect(() => {
    dispatch(getCurrentDrawer());
  }, [dispatch]);

  // Handle barcode scanner input
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if we're focused on an input
      if (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // Barcode scanners typically send Enter at the end
      if (e.key === "Enter" && barcodeInput.length > 3) {
        handleBarcodeScanned(barcodeInput);
        setBarcodeInput("");
      } else if (e.key.length === 1) {
        setBarcodeInput((prev) => prev + e.key);
        // Clear after 100ms of no input (scanner is fast)
        setTimeout(() => setBarcodeInput(""), 100);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [barcodeInput]);

  const handleBarcodeScanned = async (barcode) => {
    // Parse weight barcode (format: 2XXXXXWWWWWC where XXXXX is product code, WWWWW is weight)
    if (barcode.startsWith("2") && barcode.length === 13) {
      const productCode = barcode.substring(1, 6);
      const weight = parseInt(barcode.substring(6, 11)) / 1000; // Convert to kg
      message.info(`Weight barcode: Product ${productCode}, Weight: ${weight}kg`);
      // Here you would look up the product and add to cart with weight
    } else {
      // Regular barcode - look up product by SKU
      message.info(`Scanned: ${barcode}`);
      // Implement product lookup and add to cart
    }
  };

  const handleOpenDrawer = async (values) => {
    const result = await dispatch(openDrawer(values));
    if (result.payload?.message === "success") {
      setOpenDrawerModal(false);
      openForm.resetFields();
    }
  };

  const handleCloseDrawer = async (values) => {
    if (!currentDrawer) return;
    const result = await dispatch(closeDrawer({ id: currentDrawer.id, values }));
    if (result.payload?.message === "success") {
      setCloseDrawerModal(false);
      closeForm.resetFields();
    }
  };

  const handleCashAction = async (values) => {
    const action = cashAction === "in" ? cashIn : cashOut;
    const result = await dispatch(action(values));
    if (result.payload?.message === "success") {
      setCashModalOpen(false);
      cashForm.resetFields();
      dispatch(getCurrentDrawer());
    }
  };

  const handleLoadHoldSales = () => {
    dispatch(loadAllHoldSalePaginated({ page: 1, count: 20, status: "true" }));
    setHoldSalesDrawer(true);
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-lg shadow-sm mb-3`}>
      {/* Online/Offline Status */}
      <Tooltip title={isOnline ? "Online" : `Offline (${offlineSales.length} pending)`}>
        <Badge count={offlineSales.length} size="small">
          <Button
            type={isOnline ? "default" : "dashed"}
            danger={!isOnline}
            icon={isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
            onClick={() => isOnline && offlineSales.length > 0 && dispatch(syncOfflineSales())}
            loading={syncing}
          >
            {isOnline ? "Online" : "Offline"}
          </Button>
        </Badge>
      </Tooltip>

      {/* Cash Drawer */}
      <Tooltip title="Cash Drawer">
        <Button
          type={currentDrawer ? "primary" : "default"}
          icon={<DollarOutlined />}
          onClick={() => setDrawerOpen(true)}
        >
          {currentDrawer 
            ? `₱${Number(currentDrawer.currentBalance || currentDrawer.openingAmount).toFixed(2)}` 
            : "Open Drawer"}
        </Button>
      </Tooltip>

      {/* Hold/Open Tickets */}
      <Tooltip title="Hold Orders">
        <Button
          icon={<PauseCircleOutlined />}
          onClick={handleLoadHoldSales}
        >
          Hold Orders
        </Button>
      </Tooltip>

      {/* Barcode Scanner Input */}
      <Input
        ref={barcodeInputRef}
        placeholder="Scan barcode..."
        prefix={<BarcodeOutlined />}
        style={{ width: 150 }}
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onPressEnter={() => {
          if (barcodeInput.length > 3) {
            handleBarcodeScanned(barcodeInput);
            setBarcodeInput("");
          }
        }}
      />

      {/* Dark Mode Toggle */}
      <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
        <Button
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => setDarkMode(!darkMode)}
        />
      </Tooltip>

      {/* Cash Drawer Drawer (sidebar) */}
      <Drawer
        title="Cash Drawer Management"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={400}
      >
        {!currentDrawer ? (
          <div className="text-center py-8">
            <DollarOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <p className="mt-4 text-gray-500">No drawer is currently open</p>
            <Button
              type="primary"
              onClick={() => setOpenDrawerModal(true)}
              className="mt-4"
            >
              Open Cash Drawer
            </Button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-green-800">Drawer Open</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-gray-500">Opening:</span>
                  <p className="font-semibold">₱{Number(currentDrawer.openingAmount).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Balance:</span>
                  <p className="font-semibold text-green-600">
                    ₱{Number(currentDrawer.currentBalance || currentDrawer.openingAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCashAction("in");
                  setCashModalOpen(true);
                }}
                block
              >
                Cash In
              </Button>
              <Button
                danger
                icon={<MinusOutlined />}
                onClick={() => {
                  setCashAction("out");
                  setCashModalOpen(true);
                }}
                block
              >
                Cash Out
              </Button>
            </div>

            <Popconfirm
              title="Close Cash Drawer?"
              description="Make sure to count the cash before closing."
              onConfirm={() => setCloseDrawerModal(true)}
              okText="Yes, Close"
              cancelText="Cancel"
            >
              <Button danger block icon={<HistoryOutlined />}>
                Close Drawer
              </Button>
            </Popconfirm>
          </div>
        )}
      </Drawer>

      {/* Open Drawer Modal */}
      <Modal
        title="Open Cash Drawer"
        open={openDrawerModal}
        onCancel={() => setOpenDrawerModal(false)}
        footer={null}
      >
        <Form form={openForm} onFinish={handleOpenDrawer} layout="vertical">
          <Form.Item
            name="openingAmount"
            label="Opening Amount"
            rules={[{ required: true, message: "Enter opening amount" }]}
          >
            <InputNumber
              prefix="₱"
              style={{ width: "100%" }}
              min={0}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional notes..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Open Drawer
          </Button>
        </Form>
      </Modal>

      {/* Close Drawer Modal */}
      <Modal
        title="Close Cash Drawer"
        open={closeDrawerModal}
        onCancel={() => setCloseDrawerModal(false)}
        footer={null}
      >
        <Form form={closeForm} onFinish={handleCloseDrawer} layout="vertical">
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p>Expected Amount: <strong>₱{Number(currentDrawer?.currentBalance || 0).toFixed(2)}</strong></p>
          </div>
          <Form.Item
            name="closingAmount"
            label="Actual Cash Count"
            rules={[{ required: true, message: "Enter actual cash count" }]}
          >
            <InputNumber
              prefix="₱"
              style={{ width: "100%" }}
              min={0}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional notes..." />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" loading={loading} block>
            Close Drawer
          </Button>
        </Form>
      </Modal>

      {/* Cash In/Out Modal */}
      <Modal
        title={cashAction === "in" ? "Cash In" : "Cash Out"}
        open={cashModalOpen}
        onCancel={() => setCashModalOpen(false)}
        footer={null}
      >
        <Form form={cashForm} onFinish={handleCashAction} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Enter amount" }]}
          >
            <InputNumber
              prefix="₱"
              style={{ width: "100%" }}
              min={0.01}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Enter reason" }]}
          >
            <Input placeholder={cashAction === "in" ? "e.g., Change fund" : "e.g., Vendor payment"} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional notes..." />
          </Form.Item>
          <Button
            type="primary"
            danger={cashAction === "out"}
            htmlType="submit"
            loading={loading}
            block
          >
            {cashAction === "in" ? "Add Cash" : "Remove Cash"}
          </Button>
        </Form>
      </Modal>

      {/* Hold Sales Drawer */}
      <Drawer
        title="Hold Orders / Open Tickets"
        placement="right"
        onClose={() => setHoldSalesDrawer(false)}
        open={holdSalesDrawer}
        width={400}
      >
        <List
          loading={holdLoading}
          dataSource={holdSales || []}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => {
                    onSelectHoldSale && onSelectHoldSale(item);
                    setHoldSalesDrawer(false);
                  }}
                >
                  Resume
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`Order #${item.id}`}
                description={
                  <div>
                    <p>Customer: {item.customer?.username || "Walk-in"}</p>
                    <p>Items: {item.saleInvoiceProduct?.length || 0}</p>
                    <Tag color="orange">₱{Number(item.totalAmount || 0).toFixed(2)}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No hold orders" }}
        />
      </Drawer>
    </div>
  );
}
