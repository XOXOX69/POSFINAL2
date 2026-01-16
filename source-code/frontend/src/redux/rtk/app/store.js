import { configureStore } from "@reduxjs/toolkit";

import PurchaseReturnListSlice from "../features/PurchaseReturnList/PurchaseReturnListSlice";
import SaleReturnListSlice from "../features/SaleReturnList/SaleReturnListSlice";
import accountReducer from "../features/account/accountSlice";
import adjustInventorySlice from "../features/adjustInventory/adjustInventorySlice";
import authSlice from "../features/auth/authSlice";
import awardSlice from "../features/award/awardSlice";
import awardHistorySlice from "../features/awardHistory/awardHistorySlice";
import cartReducer from "../features/cart/cartSlice";
import colorReducer from "../features/color/colorSlice";
import customerReducer from "../features/customer/customerSlice";
import customerPaymentReducer from "../features/customerPayment/customerPaymentSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import departmentSlice from "../features/department/departmentSlice";
import designationReducer from "../features/designation/designationSlice";
import designationHistorySlice from "../features/designationHistory/designationHistorySlice";
import cartDynamicSlice from "../features/eCommerce/cart/cartSlice";
import cartOrder from "../features/eCommerce/cartOrder/cartOrderSlice";
import categoryListSlice from "../features/eCommerce/categoryList/categoryListSlice";
import courierMediumSlice from "../features/eCommerce/courierMedium/courierMediumSlice";
import currencySlice from "../features/eCommerce/currency/currencySlice";
import customerECommerce from "../features/eCommerce/customer/customerSlice";
import deliveryFeeSlice from "../features/eCommerce/deliveryFee/deliveryFeeSlice";
import discountSlice from "../features/eCommerce/discount/discountSlice";
import productPublicRelatedSlice from "../features/eCommerce/product/productPublicRelatedSlice";
import productAttributeSlice from "../features/eCommerce/productAttribute/productAttribute";
import productAttributeValueSlice from "../features/eCommerce/productAttributeValue/productAttributeValueSlice";
import productPublicSearchSlice from "../features/eCommerce/productSearch/productSearchSlice";
import returnOrderSlice from "../features/eCommerce/returnOrder/returnOrderSlice";
import reviewRatingSlice from "../features/eCommerce/reviewRating/reviewRatingSlice";
import sliderSlice from "../features/eCommerce/slider/sliderSlice";
import wishlistSlice from "../features/eCommerce/wishlist/wishlistSlice";
import educationSlice from "../features/education/educationSlice";
import emailConfigSlice from "../features/emailConfig/emailConfigSlice";
import emailConfigAppSettingSlice from "../features/EmailConfigAppSettings/emailConfigAppSettingSlice";
import employeeStatusSlice from "../features/employeeStatus/employeeStatusSlice";
import holdSaleSlice from "../features/holdSale/holdSaleSlice";
import permissionSlice from "../features/hr/role/permissionSlice";
import roleSlice from "../features/hr/role/roleSlice";
import gcashSlice from "../features/gcash/gcashSlice";
import manualPaymentSlice from "../features/manualPayment/manualPaymentSlice";
import paymentMethodSlice from "../features/paymentMethod/paymentMethodSlice";
import printPageSlice from "../features/printPage/printPageSlice";
import productSearchSlice from "../features/product/productSearchSlice";
import productReducer from "../features/product/productSlice";
import productBrandReducer from "../features/productBrand/productBrandSlice";
import productCategoryReducer from "../features/productCategory/productCategorySlice";
import ProductSortListSlice from "../features/productSortList/ProductSortListSlice";
import productSubCategoryReducer from "../features/productSubCategory/productSubCategorySlice";
import purchaseReducer from "../features/purchase/purchaseSlice";
import purchaseOrderSlice from "../features/purchaseOrder/purchaseOrderSlice";
import salaryHistorySlice from "../features/salaryHistory/salaryHistorySlice";
import saleReducer from "../features/sale/saleSlice";
import settingReducer from "../features/setting/settingSlice";
import shiftSlice from "../features/shift/shiftSlice";
import supplierReducer from "../features/supplier/supplierSlice";
import supplierPaymentReducer from "../features/supplierPayment/supplierPaymentSlice";
import termsAndConditionSlice from "../features/termsAndCondition/termsAndConditionSlice";
import transactionReducer from "../features/transaction/transactionSlice";
import uomSlice from "../features/uom/uomSlice";
import userReducer from "../features/user/userSlice";
import vatTaxSlice from "../features/vatTax/vatTaxSlice";
import storeSlice from "../features/store/storeSlice";
import allBranchesSlice from "../features/allBranches/allBranchesSlice";
import customerDisplaySlice from "../features/customerDisplay/customerDisplaySlice";
import cfdAdsSlice from "../features/cfdAds/cfdAdsSlice";
import modifiersSlice from "../features/modifiers/modifiersSlice";
import cashDrawerSlice from "../features/cashDrawer/cashDrawerSlice";
import offlineSlice from "../features/offline/offlineSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    cartDynamic: cartDynamicSlice,
    customerDisplay: customerDisplaySlice,
    suppliers: supplierReducer,
    products: productReducer,
    productSearch: productSearchSlice,
    purchases: purchaseReducer,
    purchaseReturn: PurchaseReturnListSlice,
    purchaseOrder: purchaseOrderSlice,
    customers: customerReducer,
    sales: saleReducer,
    saleReturn: SaleReturnListSlice,
    adjustInventory: adjustInventorySlice,
    users: userReducer,
    supplierPayments: supplierPaymentReducer,
    accounts: accountReducer,
    dashboard: dashboardReducer,
    transactions: transactionReducer,
    productCategories: productCategoryReducer,
    productSubCategories: productSubCategoryReducer,
    productBrands: productBrandReducer,
    designations: designationReducer,
    colors: colorReducer,
    customerPayments: customerPaymentReducer,
    vatTax: vatTaxSlice,
    role: roleSlice,
    permission: permissionSlice,
    setting: settingReducer,
    productSortList: ProductSortListSlice,
    print: printPageSlice,
    holdSale: holdSaleSlice,
    salaryHistory: salaryHistorySlice,
    designationHistory: designationHistorySlice,
    award: awardSlice,
    awardHistory: awardHistorySlice,
    education: educationSlice,
    department: departmentSlice,
    shift: shiftSlice,
    employmentStatus: employeeStatusSlice,
    emailConfig: emailConfigSlice,
    emailConfigAppSetting: emailConfigAppSettingSlice,
    uom: uomSlice,
    termsAndConditions: termsAndConditionSlice,
    // e-commerce slice
    customerECommerce: customerECommerce,
    courierMedium: courierMediumSlice,
    currency: currencySlice,
    discount: discountSlice,
    reviewRating: reviewRatingSlice,
    productAttribute: productAttributeSlice,
    productAttributeValue: productAttributeValueSlice,
    categoryList: categoryListSlice,
    productPublicRelated: productPublicRelatedSlice,
    productPublicSearch: productPublicSearchSlice,
    slider: sliderSlice,
    wishlist: wishlistSlice,
    ESale: cartOrder,
    auth: authSlice,
    gcash: gcashSlice,
    manualPayment: manualPaymentSlice,
    paymentMethod: paymentMethodSlice,
    returnOrder: returnOrderSlice,
    deliveryFee: deliveryFeeSlice,
    store: storeSlice,
    allBranches: allBranchesSlice,
    cfdAds: cfdAdsSlice,
    modifiers: modifiersSlice,
    cashDrawer: cashDrawerSlice,
    offline: offlineSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable immutability check in production for better performance
      immutableCheck: process.env.NODE_ENV === 'development',
      // Disable serializable check for better performance
      serializableCheck: false,
    }),
  // Enable Redux DevTools only in development
  devTools: process.env.NODE_ENV === 'development',
});

export default store;
