import { cn } from "@/utils/functions";
import {
  AppstoreOutlined,
  CodeSandboxOutlined,
  FileDoneOutlined,
  FileOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
  HomeOutlined,
  ImportOutlined,
  MinusSquareOutlined,
  OrderedListOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  UngroupOutlined,
  UnorderedListOutlined,
  UserOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { BiSolidDiscount } from "react-icons/bi";
import { BsBuildingFillGear } from "react-icons/bs";
import { CiShop } from "react-icons/ci";
import { FaBusinessTime } from "react-icons/fa";
import { GiTakeMyMoney, GiTicket } from "react-icons/gi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import {
  MdAcUnit,
  MdOutlineAttachMoney,
  MdOutlineEditAttributes,
  MdOutlineInvertColors,
  MdShoppingCartCheckout,
} from "react-icons/md";
import { TbShoppingCartCog, TbTruckReturn } from "react-icons/tb";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Menu from "../../UI/Menu";
import usePermissions from "../../utils/usePermissions";
import SideNavLoader from "./SideNavLoader";

const SideNav = ({ collapsed, setCollapsed }) => {
  const { permissions } = usePermissions();
  const [isSetting, setIsSetting] = useState(false);
  const { loading } = useSelector((state) => state.auth);

  const { data } = useSelector((state) => state?.setting) || {};

  const menu = [
    Array.isArray(permissions) &&
      permissions.length > 0 && {
        label: (
          <NavLink to="/admin/dashboard">
            <span>DASHBOARD</span>
          </NavLink>
        ),
        key: "dashboard",
        icon: <HomeOutlined />,
      },

    // Store/Branch Management - Admin only
    {
      label: (
        <NavLink to="/admin/store">
          <span>BRANCHES</span>
        </NavLink>
      ),
      permit: {
        permissions: ["create-store", "readAll-store"],
        operator: "or",
      },
      key: "branches",
      icon: <ShopOutlined />,
    },

    data?.dashboardType === "e-commerce" && {
      label: "E-COMMERCE",
      permit: {
        permissions: [
          "create-discount",
          "create-sliderImages",
          "readAll-discount",
          "readAll-sliderImages",
        ],
        operator: "or",
      },
      key: "e-Commerce",
      icon: <CiShop />,
      children: [
        {
          label: (
            <NavLink to="/admin/order">
              <span>Order</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-shippingTime", "readAll-shippingTime"],
            operator: "or",
          },
          key: "CartOrder",
          icon: <HiOutlineShoppingBag />,
        },
        {
          label: (
            <NavLink to="/admin/return-order">
              <span>Return Orders</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-returnCartOrder", "readAll-returnCartOrder"],
            operator: "or",
          },
          key: "return-order",
          icon: <TbTruckReturn />,
        },
        {
          label: (
            <NavLink to="/admin/resend-return-order">
              <span>Resend Return Orders </span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-returnCartOrder", "readAll-returnCartOrder"],
            operator: "or",
          },
          key: "resend-return",
          icon: <MdShoppingCartCheckout />,
        },
        {
          label: (
            <NavLink to="/admin/manual-payment">
              <span>Payment List</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-manualPayment", "readAll-manualPayment"],
            operator: "or",
          },
          key: "manualPayment",
          icon: <GiTakeMyMoney />,
        },
        {
          label: (
            <NavLink to="/admin/gcash-transactions">
              <span>GCash Payments</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-gcashTransaction", "readAll-gcashTransaction"],
            operator: "or",
          },
          key: "gcashPayment",
          icon: <WalletOutlined />,
        },
      ],
    },
    {
      label: (
        <NavLink to="/admin/pos">
          <span>POS</span>
        </NavLink>
      ),

      key: "pos",
      icon: <ShoppingCartOutlined />,
    },
    {
      label: "INVENTORY",
      key: "inventory",
      permit: {
        permissions: ["create-product", "readAll-product"],
        operator: "or",
      },
      icon: <CodeSandboxOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/product">
              <span>Product</span>
            </NavLink>
          ),
          key: "products",
          icon: <UnorderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/product-sort-list">
              <span>Shortage Products</span>
            </NavLink>
          ),
          key: "productSortList",
          icon: <OrderedListOutlined />,
        },
        // {
        //   label: (
        //     <NavLink to="/admin/adjust-inventory">
        //       <span>Adjust Inventory</span>
        //     </NavLink>
        //   ),
        //   key: "adjust-inventory",
        //   icon: <PiWarehouseBold />,
        // },
      ],
    },

    {
      label: "PURCHASE",
      permit: {
        permissions: ["create-purchaseInvoice", "readAll-purchaseInvoice"],
        operator: "or",
      },
      key: "PURCHASE",
      icon: <PlusSquareOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/purchase">
              <span>Purchase Invoice</span>
            </NavLink>
          ),
          key: "purchases",
          icon: <UnorderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/supplier">
              <span>Suppliers</span>
            </NavLink>
          ),
          key: "suppliers",
          icon: <UserOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/purchase-return-list">
              <span>Purchase Return </span>
            </NavLink>
          ),
          key: "purchaseReturn",
          icon: <OrderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/purchase-reorder-invoice">
              <span>Purchase Order </span>
            </NavLink>
          ),
          key: "purchaseOrder",
          icon: <OrderedListOutlined />,
        },
      ],
    },
    {
      label: "SALE",
      permit: {
        permissions: ["create-saleInvoice", "readAll-saleInvoice"],
        operator: "or",
      },
      key: "SALE",
      icon: <MinusSquareOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/sale">
              <span>Sale Invoice</span>
            </NavLink>
          ),
          key: "sells",
          icon: <UnorderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/customer">
              <span>Customers</span>
            </NavLink>
          ),
          key: "customers",
          icon: <UserOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/sale-return-list">
              <span>Sale Return </span>
            </NavLink>
          ),
          key: "saleReturn",
          icon: <OrderedListOutlined />,
        },
        // {
        //   label: (
        //     <NavLink to="/admin/quotation">
        //       <span>Quotation</span>
        //     </NavLink>
        //   ),
        //   permit: {
        //     permissions: ["create-quote", "readAll-quote"],
        //     operator: "or",
        //   },
        //   key: "QUOTATION",
        //   icon: <MdRequestQuote />,
        // },
      ],
    },

    {
      label: "ACCOUNTS",
      permit: {
        permissions: ["create-account", "readAll-account"],
        operator: "or",
      },
      key: "accounts",
      icon: <WalletOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/account/">
              <span>Account</span>
            </NavLink>
          ),
          key: "accountList",
          icon: <UnorderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/transaction/">
              <span>Transaction</span>
            </NavLink>
          ),
          key: "transactionList",
          icon: <UnorderedListOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/account/trial-balance">
              <span>Trial Balance</span>
            </NavLink>
          ),
          key: "trialBalance",
          icon: <FileDoneOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/account/balance-sheet">
              <span>Balance Sheet</span>
            </NavLink>
          ),
          key: "balanceSheet",
          icon: <FileOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/account/income">
              <span>Income Statement</span>
            </NavLink>
          ),
          key: "incomeStatement",
          icon: <FileSyncOutlined />,
        },
      ],
    },
    Array.isArray(permissions) &&
      permissions.length > 0 && {
        label: "REPORT",
        key: "report",
        icon: <IoDocumentTextOutline size={16} />,
        children: [
          {
            label: (
              <NavLink to="/admin/product-report">
                <span>Inventory Report</span>
              </NavLink>
            ),
            key: "productReport",
            icon: <FileSyncOutlined />,
          },
          {
            label: (
              <NavLink to="/admin/purchase-report">
                <span>Purchase Report</span>
              </NavLink>
            ),
            key: "purchaseReport",
            icon: <FileSyncOutlined />,
          },
          {
            label: (
              <NavLink to="/admin/sale-report">
                <span>Sale Report</span>
              </NavLink>
            ),
            key: "saleReport",
            icon: <FileSyncOutlined />,
          },
          {
            label: (
              <NavLink to="/admin/supplier-report">
                <span>Supplier Report</span>
              </NavLink>
            ),
            key: "supplierReport",
            icon: <FileSyncOutlined />,
          },
          {
            label: (
              <NavLink to="/admin/customer-report">
                <span>Customer Report</span>
              </NavLink>
            ),
            key: "customerReport",
            icon: <FileSyncOutlined />,
          },
          {
            label: (
              <NavLink to="/admin/payment-report">
                <span>Payment Report</span>
              </NavLink>
            ),
            key: "paymentReport",
            icon: <FileSyncOutlined />,
          },
          // {
          //   label: (
          //     <NavLink to='/admin/return-order-report'>
          //       <span>Return Order Report</span>
          //     </NavLink>
          //   ),
          //   key: "returnOrderReport",
          //   icon: <FileSyncOutlined />,
          // },
        ],
      },

    // data?.dashboardType !== "e-commerce" && {
    //   label: "E-COMMERCE",
    //   permit: {
    //     permissions: [
    //       "create-discount",
    //       "create-sliderImages",
    //       "readAll-discount",
    //       "readAll-sliderImages",
    //     ],
    //     operator: "or",
    //   },
    //   key: "e-Commerce",
    //   icon: <CiShop />,
    //   children: [
    //     {
    //       label: (
    //         <NavLink to="/admin/order">
    //           <span>Order</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-shippingTime", "readAll-shippingTime"],
    //         operator: "or",
    //       },
    //       key: "CartOrder",
    //       icon: <HiOutlineShoppingBag />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/return-order">
    //           <span>Return Orders</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-returnCartOrder", "readAll-returnCartOrder"],
    //         operator: "or",
    //       },
    //       key: "return-order",
    //       icon: <TbTruckReturn />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/resend-return-order">
    //           <span>Resend Return Orders </span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-returnCartOrder", "readAll-returnCartOrder"],
    //         operator: "or",
    //       },
    //       key: "resend-return",
    //       icon: <MdShoppingCartCheckout />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/manual-payment">
    //           <span>Payment List</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-manualPayment", "readAll-manualPayment"],
    //         operator: "or",
    //       },
    //       key: "manualPayment",
    //       icon: <GiTakeMyMoney />,
    //     },
    //   ],
    // },
    // {
    //   label: "E-COM SETTINGS",
    //   permit: {
    //     permissions: ["create-paymentMethod", "readAll-paymentMethod"],
    //     operator: "or",
    //   },
    //   key: "e-comSettings",
    //   icon: (
    //     <svg
    //       stroke="currentColor"
    //       fill="none"
    //       strokeWidth="2"
    //       viewBox="0 0 24 24"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //       xmlns="http://www.w3.org/2000/svg"
    //       width="1em"
    //       height="1em"
    //     >
    //       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    //       <path d="M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
    //       <path d="M12 17h-6v-14h-2"></path>
    //       <path d="M6 5l14 1l-.79 5.526m-3.21 1.474h-10"></path>
    //       <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
    //       <path d="M19.001 15.5v1.5"></path>
    //       <path d="M19.001 21v1.5"></path>
    //       <path d="M22.032 17.25l-1.299 .75"></path>
    //       <path d="M17.27 20l-1.3 .75"></path>
    //       <path d="M15.97 17.25l1.3 .75"></path>
    //       <path d="M20.733 20l1.3 .75"></path>
    //     </svg>
    //   ),
    //   children: [
    //     {
    //       label: (
    //         <NavLink to="/admin/delivery-fee">
    //           <span>Delivery area</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-deliveryFee", "readAll-deliveryFee"],
    //         operator: "or",
    //       },
    //       key: "deliveryArea",
    //       icon: <MdOutlineReviews />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/payment-method">
    //           <span> Payment Methods</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-paymentMethod", "readAll-paymentMethod"],
    //         operator: "or",
    //       },
    //       key: "paymentMethod",
    //       icon: <RiSecurePaymentLine />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/slider">
    //           <span>Image Slider</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-sliderImages", "readAll-sliderImages"],
    //         operator: "or",
    //       },
    //       key: "Slider",
    //       icon: <LiaSlidersHSolid />,
    //     },
    //     {
    //       label: (
    //         <NavLink to="/admin/courier-medium">
    //           <span>Delivery Medium</span>
    //         </NavLink>
    //       ),
    //       permit: {
    //         permissions: ["create-courier", "readAll-courier"],
    //         operator: "or",
    //       },
    //       key: "deliveryMedium",

    //       icon: <TbTruckDelivery />,
    //     },
    //   ],
    // },
  ];

  const SettingMenu = [
    {
      label: (
        <NavLink to="/admin/company-setting">
          <span>Company settings</span>
        </NavLink>
      ),
      key: "invoiceSetting",
      icon: <BsBuildingFillGear />,
    },
    {
      label: (
        <NavLink to="/admin/app-settings">
          <span>App settings</span>
        </NavLink>
      ),
      key: "appSettings",
      icon: <BsBuildingFillGear />,
    },
    {
      label: (
        <NavLink to="/admin/cfd-ads">
          <span>CFD Advertisements</span>
        </NavLink>
      ),
      key: "cfdAds",
      icon: <BsBuildingFillGear />,
    },
    {
      label: (
        <NavLink to="/admin/modifiers">
          <span>Item Modifiers</span>
        </NavLink>
      ),
      permit: {
        permissions: ["create-product"],
        operator: "or",
      },
      key: "modifiers",
      icon: <BsBuildingFillGear />,
    },
    {
      label: (
        <NavLink to="/admin/cash-drawer">
          <span>Cash Drawer</span>
        </NavLink>
      ),
      permit: {
        permissions: ["readAll-saleInvoice"],
        operator: "or",
      },
      key: "cashDrawer",
      icon: <BsBuildingFillGear />,
    },
    {
      label: (
        <NavLink to="/admin/store">
          <span>Store / Branch</span>
        </NavLink>
      ),
      permit: {
        permissions: ["create-store", "readAll-store"],
        operator: "or",
      },
      key: "storeBranch",
      icon: <ShopOutlined />,
    },
    {
      label: "HR",
      permit: {
        permissions: ["create-user", "readAll-user"],
        operator: "or",
      },
      key: "hr",
      icon: <TeamOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/hr/staffs">
              <span>Staffs</span>
            </NavLink>
          ),
          key: "staffs",
          icon: <UsergroupAddOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/role">
              <span>Role & Permissions</span>
            </NavLink>
          ),
          key: "roleAndPermissions",
          icon: <UserSwitchOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/designation/">
              <span>Designation</span>
            </NavLink>
          ),
          key: "designation",
          icon: <SolutionOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/department/">
              <span>Department</span>
            </NavLink>
          ),
          key: "department",
          icon: <HiOutlineBuildingOffice2 />,
        },
        {
          label: (
            <NavLink to="/admin/shift/">
              <span>Shift</span>
            </NavLink>
          ),
          key: "shift",
          icon: <FaBusinessTime />,
        },
        {
          label: (
            <NavLink to="/admin/employment-status/">
              <span>Employment Status</span>
            </NavLink>
          ),
          key: "employmentStatus",
          icon: <FaBusinessTime />,
        },
      ],
    },
    {
      label: "Inventory",
      key: "inventory",
      icon: <TbShoppingCartCog />,
      children: [
        {
          label: (
            <NavLink to="/admin/product-category">
              <span>Product Category</span>
            </NavLink>
          ),
          key: "productCategory",
          icon: <AppstoreOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/product-subcategory">
              <span>Product Subcategory</span>
            </NavLink>
          ),
          key: "productSubcategory",
          icon: <UngroupOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/product-brand">
              <span>Product Brand</span>
            </NavLink>
          ),
          key: "productBrand",
          icon: <FileProtectOutlined />,
        },

        {
          label: (
            <NavLink to="/admin/product-color">
              <span>Product Color</span>
            </NavLink>
          ),
          key: "productColor",
          icon: <MdOutlineInvertColors />,
        },
        {
          label: (
            <NavLink to="/admin/product-attribute">
              <span>Product Attribute</span>
            </NavLink>
          ),
          key: "productAttribute",
          icon: <MdOutlineEditAttributes />,
        },

        {
          label: (
            <NavLink to="/admin/uom">
              <span>UoM</span>
            </NavLink>
          ),
          key: "UoM",
          icon: <MdAcUnit />,
        },
        {
          label: (
            <NavLink to="/admin/import-product">
              <span>Import Product </span>
            </NavLink>
          ),
          key: "import_csv",
          icon: <ImportOutlined />,
        },
        {
          label: (
            <NavLink to="/admin/print-page-setting">
              <span>Barcode page setting</span>
            </NavLink>
          ),
          key: "Barcode page setting",
        },
      ],
    },
    {
      label: "Others",
      key: "Others",
      icon: <SettingOutlined />,
      children: [
        {
          label: (
            <NavLink to="/admin/discount">
              <span>Discount</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-discount", "readAll-discount"],
            operator: "or",
          },
          key: "Discount",
          icon: <BiSolidDiscount />,
        },
        {
          label: (
            <NavLink to="/admin/currency">
              <span>Currency</span>
            </NavLink>
          ),
          permit: {
            permissions: ["create-currency", "readAll-currency"],
            operator: "or",
          },
          key: "Currency",
          icon: <MdOutlineAttachMoney />,
        },
        {
          label: (
            <NavLink to="/admin/vat-tax">
              <span>VAT/TAX</span>
            </NavLink>
          ),
          key: "VAT/TAX",
          icon: <SettingOutlined />,
        },
      ],
    },
  ];

  return (
    <div className="overflow-y-auto no-scrollbar h-[calc(100vh-100px)] pb-4 scroll-smooth">
      {loading ? (
        <SideNavLoader />
      ) : (
        <div className="relative">
          <div
            className={cn(
              `transition-all duration-500 ease-out transform ${
                isSetting ? "hidden" : "block"
              }`
            )}>
            <Menu
              items={menu}
              setCollapsed={setCollapsed}
              permissions={permissions}
              collapsed={collapsed}
            />
            {Array.isArray(permissions) && permissions.length > 0 && (
              <div
                className={cn(
                  "px-4 flex items-center justify-between font-Popins hover:bg-[rgb(71,74,120)] py-3 cursor-pointer transition-all duration-300 group",
                  {
                    "flex items-center justify-center px-0 text-lg": collapsed,
                  }
                )}
                onClick={() => setIsSetting(true)}>
                <span className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1">
                  <SettingOutlined className="transition-transform duration-300 group-hover:rotate-90" /> 
                  {!collapsed && "Settings"}
                </span>
                {!collapsed && <IoIosArrowForward className="transition-transform duration-300 group-hover:translate-x-1" />}
              </div>
            )}
          </div>

          <div
            className={cn(
              `transition-all duration-500 ease-out transform ${
                isSetting ? "block" : "hidden"
              }`
            )}>
            <div
              className={cn(
                "px-4 flex items-center font-medium gap-2 font-Popins bg-[rgb(71,74,95)] hover:bg-[rgb(71,74,120)] py-3 cursor-pointer transition-all duration-300 group",
                {
                  "flex items-center justify-center text-lg": collapsed,
                }
              )}
              onClick={() => setIsSetting(false)}>
              <IoIosArrowBack className="transition-transform duration-300 group-hover:-translate-x-1" /> 
              {!collapsed && "Back to menu"}
            </div>
            <hr className="border-gray-500/50" />
            <Menu
              items={SettingMenu}
              setCollapsed={setCollapsed}
              permissions={permissions}
              collapsed={collapsed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SideNav;
