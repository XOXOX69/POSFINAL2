import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Table,
  Button,
  Tag,
  Statistic,
  Row,
  Col,
  DatePicker,
  Modal,
  Descriptions,
  Timeline,
  Empty,
} from "antd";
import {
  DollarOutlined,
  HistoryOutlined,
  EyeOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import UserPrivateComponent from "../PrivacyComponent/UserPrivateComponent";

export default function CashDrawerManagement() {
  const [loading, setLoading] = useState(false);
  const [drawerHistory, setDrawerHistory] = useState([]);
  const [selectedDrawer, setSelectedDrawer] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalSales: 0,
    avgDiscrepancy: 0,
  });

  useEffect(() => {
    loadDrawerHistory();
  }, [dateRange]);

  const loadDrawerHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange[0]) params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange[1]) params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      
      const { data } = await axios.get(`/cash-drawer/history?${params.toString()}`);
      
      if (data?.data) {
        setDrawerHistory(data.data.drawers || []);
        setStats(data.data.stats || {
          totalSessions: 0,
          totalCashIn: 0,
          totalCashOut: 0,
          totalSales: 0,
          avgDiscrepancy: 0,
        });
      }
    } catch (error) {
      console.error("Failed to load drawer history:", error);
      setDrawerHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const viewDrawerDetails = async (drawer) => {
    try {
      const { data } = await axios.get(`/cash-drawer/${drawer.id}`);
      setSelectedDrawer(data?.data || drawer);
      setDetailsModalOpen(true);
    } catch (error) {
      setSelectedDrawer(drawer);
      setDetailsModalOpen(true);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Opened By",
      dataIndex: "openedBy",
      key: "openedBy",
      render: (user) => user?.username || "Unknown",
    },
    {
      title: "Opening Amount",
      dataIndex: "openingAmount",
      key: "openingAmount",
      render: (amt) => `₱${Number(amt || 0).toFixed(2)}`,
    },
    {
      title: "Closing Amount",
      dataIndex: "closingAmount",
      key: "closingAmount",
      render: (amt) => amt ? `₱${Number(amt).toFixed(2)}` : "-",
    },
    {
      title: "Expected",
      dataIndex: "expectedAmount",
      key: "expectedAmount",
      render: (amt) => amt ? `₱${Number(amt).toFixed(2)}` : "-",
    },
    {
      title: "Discrepancy",
      key: "discrepancy",
      render: (_, record) => {
        if (!record.closingAmount || !record.expectedAmount) return "-";
        const diff = Number(record.closingAmount) - Number(record.expectedAmount);
        const color = diff === 0 ? "green" : diff > 0 ? "blue" : "red";
        return <Tag color={color}>₱{diff.toFixed(2)}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "open" ? "green" : "default"}>
          {status?.toUpperCase() || "UNKNOWN"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => viewDrawerDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <UserPrivateComponent permission="readAll-saleInvoice">
      <div className="space-y-4">
        {/* Stats Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sessions"
                value={stats.totalSessions}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Cash In"
                value={stats.totalCashIn}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Cash Out"
                value={stats.totalCashOut}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sales"
                value={stats.totalSales}
                precision={2}
                prefix="₱"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* History Table */}
        <Card
          title={
            <span>
              <DollarOutlined /> Cash Drawer History
            </span>
          }
          extra={
            <DatePicker.RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={drawerHistory}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} sessions`,
            }}
          />
        </Card>

        {/* Details Modal */}
        <Modal
          title="Cash Drawer Details"
          open={detailsModalOpen}
          onCancel={() => setDetailsModalOpen(false)}
          width={700}
          footer={[
            <Button key="print" icon={<PrinterOutlined />}>
              Print Report
            </Button>,
            <Button key="close" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>,
          ]}
        >
          {selectedDrawer && (
            <div className="space-y-4">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Status">
                  <Tag color={selectedDrawer.status === "open" ? "green" : "default"}>
                    {selectedDrawer.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(selectedDrawer.createdAt).format("MMM DD, YYYY h:mm A")}
                </Descriptions.Item>
                <Descriptions.Item label="Opened By">
                  {selectedDrawer.openedBy?.username || "Unknown"}
                </Descriptions.Item>
                <Descriptions.Item label="Closed By">
                  {selectedDrawer.closedBy?.username || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Opening Amount">
                  ₱{Number(selectedDrawer.openingAmount || 0).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Closing Amount">
                  {selectedDrawer.closingAmount 
                    ? `₱${Number(selectedDrawer.closingAmount).toFixed(2)}`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Expected Amount">
                  {selectedDrawer.expectedAmount 
                    ? `₱${Number(selectedDrawer.expectedAmount).toFixed(2)}`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Discrepancy">
                  {selectedDrawer.closingAmount && selectedDrawer.expectedAmount ? (
                    <Tag color={
                      Number(selectedDrawer.closingAmount) - Number(selectedDrawer.expectedAmount) === 0 
                        ? "green" 
                        : Number(selectedDrawer.closingAmount) - Number(selectedDrawer.expectedAmount) > 0 
                          ? "blue" 
                          : "red"
                    }>
                      ₱{(Number(selectedDrawer.closingAmount) - Number(selectedDrawer.expectedAmount)).toFixed(2)}
                    </Tag>
                  ) : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Opening Notes" span={2}>
                  {selectedDrawer.openingNotes || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Closing Notes" span={2}>
                  {selectedDrawer.closingNotes || "-"}
                </Descriptions.Item>
              </Descriptions>

              <Card title="Transaction History" size="small">
                {selectedDrawer.transactions?.length > 0 ? (
                  <Timeline
                    items={selectedDrawer.transactions?.map((tx) => ({
                      color: tx.type === "sale" ? "green" : tx.type === "cash_in" ? "blue" : "red",
                      children: (
                        <div>
                          <strong>
                            {tx.type === "sale" ? "Sale" : tx.type === "cash_in" ? "Cash In" : "Cash Out"}
                          </strong>
                          <span className="ml-2">
                            {tx.type === "cash_out" ? "-" : "+"}₱{Number(tx.amount || 0).toFixed(2)}
                          </span>
                          {tx.reason && <p className="text-gray-500 text-sm">{tx.reason}</p>}
                          <span className="text-xs text-gray-400">
                            {dayjs(tx.createdAt).format("h:mm A")}
                          </span>
                        </div>
                      ),
                    })) || []}
                  />
                ) : (
                  <Empty description="No transactions" />
                )}
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </UserPrivateComponent>
  );
}
