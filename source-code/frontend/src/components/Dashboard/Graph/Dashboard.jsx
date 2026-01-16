import React, { useState } from "react";

import moment from "moment";
import { useSelector } from "react-redux";
import QuickLink from "../../../layouts/QuickLink";
import Content from "../RecentContent/Content";
import InventoryContent from "../RecentContent/InventoryContent";
import DemoLine from "./Demoline";
import LiveCharts from "./LiveCharts";
import Footer from "../../../layouts/Footer";
import ActiveUsers from "../ActiveUsers/ActiveUsers";

const Dashboard = () => {
  const { data, loading } = useSelector((state) => state?.setting) || {};
  const [pageConfig, setPageConfig] = useState({
    count: 5,
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
  });

  let card;
  if (loading) {
    card = (
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-5 mb-5 animate-fadeIn">
        <div className="ant-shadow w-full h-[70px] md:h-[120px] bg-slate-100 animate-pulse rounded-2xl shimmer-effect"></div>
        <div className="ant-shadow w-full h-[70px] md:h-[120px] bg-slate-100 animate-pulse rounded-2xl shimmer-effect" style={{animationDelay: '0.1s'}}></div>
        <div className="ant-shadow w-full h-[70px] md:h-[120px] bg-slate-100 animate-pulse rounded-2xl shimmer-effect" style={{animationDelay: '0.2s'}}></div>
        <div className="ant-shadow w-full h-[70px] md:h-[120px] bg-slate-100 animate-pulse rounded-2xl shimmer-effect" style={{animationDelay: '0.3s'}}></div>
      </section>
    );
  } else if (data && !loading) {
    card = <DemoLine pageConfig={pageConfig} data={data} />;
  } else if (!data && !loading) {
    card = "";
  }

  // Get dashboard information for live charts
  const cardInformation = useSelector((state) => state.dashboard.info);

  return (
    <div className="dashboard-container">
      <div className="mb-5 animate-slideDown">
        <QuickLink pageConfig={pageConfig} setPageConfig={setPageConfig} />
      </div>

      {/* Currently Working Section - Below Quick Action */}
      <div className="mb-5 animate-fadeIn" style={{maxWidth: '320px'}}>
        <ActiveUsers />
      </div>

      <div className="mb-5 animate-fadeIn">
        {card}
      </div>
      
      {/* Live Charts Section */}
      <div className="mb-5 animate-fadeIn" style={{animationDelay: '0.15s'}}>
        <LiveCharts information={cardInformation} />
      </div>

      {/* Recent Content Section */}
      <div className="mb-5 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        {data?.dashboardType === "inventory" ? (
          <InventoryContent pageConfig={pageConfig} />
        ) : (
          <Content pageConfig={pageConfig} />
        )}
      </div>

      <Footer data={data} />
    </div>
  );
};

export default Dashboard;
