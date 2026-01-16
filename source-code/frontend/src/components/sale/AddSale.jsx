import { Button, DatePicker, Form, Input, Select } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAllCustomer } from "../../redux/rtk/features/customer/customerSlice";
import { loadProduct } from "../../redux/rtk/features/product/productSlice";
import { addSale } from "../../redux/rtk/features/sale/saleSlice";
import { updateCustomerDisplay, clearCustomerDisplay } from "../../redux/rtk/features/customerDisplay/customerDisplaySlice";
import Products from "./Products";

import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { loadAllTermsAndConditions } from "../../redux/rtk/features/termsAndCondition/termsAndConditionSlice";
import { loadAllStaff } from "../../redux/rtk/features/user/userSlice";
import { loadAllVatTax } from "../../redux/rtk/features/vatTax/vatTaxSlice";
import getStaffId from "../../utils/getStaffId";
import BigDrawer from "../Drawer/BigDrawer";
import AddTermsAndConditions from "../TermsAndConditions/AddTermsAndConditions";
import AddCust from "../customer/AddCustomer";
import Payments from "./Payments";

const AddSale = () => {
  const { Option } = Select;
  const [loader, setLoader] = useState(false);
  const [subTotal, setSubTotal] = useState([]);
  const [due, setDue] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedTermsAndConditions, setSelectedTermsAndConditions] =
    useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Form Function
  const [form] = Form.useForm();

  const allCustomer = useSelector((state) => state.customers.list);
  const { list: productList, loading: productLoading } = useSelector(
    (state) => state.products
  );

  const { list: termsAndConditions, loading } = useSelector(
    (state) => state.termsAndConditions
  );

  const staffId = getStaffId();
  const [userId, setUserId] = useState(staffId);

  const allStaff = useSelector((state) => state.users.list);
  useEffect(() => {
    dispatch(loadAllStaff({ status: "true" }));
    dispatch(loadAllCustomer({ page: 1, count: 100 }));
    dispatch(loadProduct({ query: "all" }));
    dispatch(loadAllVatTax());
    dispatch(loadAllTermsAndConditions());
  }, [dispatch]);

  const onFormSubmit = async (values) => {
    try {
      const mergedObject = values.saleInvoiceProduct.reduce(
        (accumulator, currentObject) => {
          const productId = currentObject.productId;
          if (!accumulator[productId]) {
            accumulator[productId] = { ...currentObject };
          } else {
            accumulator[productId].productQuantity +=
              currentObject.productQuantity;
          }
          return accumulator;
        },
        {}
      );

      const mergedArray = Object.values(mergedObject);
      const productArray = mergedArray.map((item) => {
        const quantity = item?.productQuantity || 0;
        const price = item?.productSalePrice || 0;
        const data = {
          productId: item.productId,
          productQuantity: item.productQuantity,
          productUnitSalePrice: item.productSalePrice,
          tax: item.productVat,
        };

        data.productDiscount = item.productDiscount;
        if (item.discountType === "percentage") {
          data.productDiscount =
            (price * quantity * item?.productDiscount) / 100;
        }

        return data;
      });
      const data = {
        ...values,
        userId: userId,
        saleInvoiceProduct: productArray,
        paidAmount: values.paidAmount || [],
      };
      const resp = await dispatch(addSale(data));
      if (resp.payload.message === "success") {
        form.resetFields();
        setLoader(false);
        // Clear customer display after successful sale
        dispatch(clearCustomerDisplay());
        navigate(`/admin/sale/${resp.payload.data.id}`);
      } else {
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  const customer = allCustomer?.find((item) => item.id === selectedCustomer);

  // total calculate
  const totalCalculator = () => {
    const productArray = form.getFieldValue("saleInvoiceProduct");
    const subTotal =
      productArray?.reduce((subTotal, current) => {
        const quantity = current?.productQuantity || 0;
        const price = current?.productSalePrice || 0;
        let discount = current?.productDiscount || 0;
        if (current?.discountType === "percentage") {
          discount = (price * quantity * discount) / 100;
        }

        const vat = current?.productVat || 0;
        const subPrice = price * quantity - discount;
        const totalVat = (vat / 100) * subPrice;

        return [
          ...subTotal,
          { subDiscount: discount, subVatAmount: totalVat, subPrice },
        ];
      }, []) || [];

    setSubTotal(subTotal);

    const total = subTotal.reduce((acc, item) => {
      return acc + item.subPrice;
    }, 0);
    const totalTaxAmount = subTotal.reduce((acc, item) => {
      return acc + item.subVatAmount;
    }, 0);
    const totalPayable = total + totalTaxAmount;
    const paidAmountArray = form.getFieldValue("paidAmount") || [];
    const paidAmount = paidAmountArray?.reduce((acc, item) => {
      return acc + (item.amount ? parseInt(item.amount) : 0);
    }, 0);
    const due = totalPayable - paidAmount;
    setDue(due);

    // Update customer display screen
    const totalDiscountAmount = subTotal.reduce((acc, item) => acc + item.subDiscount, 0);
    const displayItems = productArray?.filter(item => item.productId) || [];
    dispatch(updateCustomerDisplay({
      items: displayItems,
      subtotal: total,
      tax: totalTaxAmount,
      discount: totalDiscountAmount,
      total: totalPayable,
      customerName: customer?.name || "",
    }));
  };

  const total = subTotal.reduce((acc, item) => {
    return acc + item.subPrice;
  }, 0);
  const totalTaxAmount = subTotal.reduce((acc, item) => {
    return acc + item.subVatAmount;
  }, 0);
  const totalDiscount = subTotal.reduce((acc, item) => {
    return acc + item.subDiscount;
  }, 0);

  const totalPayable = total + totalTaxAmount;
  return (
    <Form
      form={form}
      name="dynamic_form_nest_item"
      onFinish={onFormSubmit}
      onFinishFailed={() => {
        setLoader(false);
      }}
      layout="vertical"
      size="large"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      autoComplete="off"
      initialValues={{
        discount: 0,
        date: dayjs(),
        vatId: [],
        saleInvoiceProduct: [{}],
        paymentType: 1,
      }}>
      <div className="flex gap-2 2xl:h-[calc(100vh-100px)] min-h-[500px]">
        <div className="w-[70%] 2xl:w-[75%]">
          <Products
            form={form}
            totalCalculator={totalCalculator}
            subTotal={subTotal}
            productList={productList}
            productLoading={productLoading}
          />
        </div>
        <div className="flex flex-col w-[30%] 2xl:w-[25%] 2xl:h-[calc(100vh-80px)]">
          <div className="flex-grow 2xl:overflow-y-auto 2xl:overflow-x-hidden  pl-2">
            <Form.Item
              label={
                <>
                  Customer
                  <BigDrawer title={"new Customer"}>
                    <AddCust drawer={true} />
                  </BigDrawer>
                </>
              }
              className="w-full mb-0"
              name="customerId"
              rules={[
                {
                  required: true,
                  message: "Please Select a Customer!",
                },
              ]}>
              <Select
                className="w-full"
                loading={!allCustomer}
                showSearch
                onChange={(id) => setSelectedCustomer(id)}
                placeholder="Select a customer "
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }>
                {allCustomer &&
                  allCustomer?.map((sup) => (
                    <Option key={sup.id} value={sup.id}>
                      {sup.username}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            {(customer?.address || customer?.phone) && (
              <div className="flex justify-between py-1 px-4">
                <span>
                  <span>Address: </span>
                  <span>{customer?.address}</span>{" "}
                </span>
                <span>
                  <span>Phone: </span>
                  <span>{customer?.phone}</span>{" "}
                </span>
              </div>
            )}

            <Form.Item
              label="Date"
              required
              className="w-full mb-0"
              name="date"
              rules={[
                {
                  required: true,
                  message: "Please input Date!",
                },
              ]}>
              <DatePicker label="date" size="small" format={"YYYY-MM-DD"} />
            </Form.Item>
            <Form.Item label="Due date" className="w-full mb-0" name="dueDate">
              <DatePicker label="date" size="small" format={"YYYY-MM-DD"} />
            </Form.Item>

            <Form.Item
              className="w-full mb-0"
              label="Sales Person"
              name="userId"
              required>
              <Select
                className="w-full"
                loading={!allStaff}
                showSearch
                placeholder="Select sales person "
                optionFilterProp="children"
                onChange={(value) => setUserId(value)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }>
                {allStaff &&
                  allStaff?.map((info) => (
                    <Option key={info.id} value={info.id}>
                      {info.username}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item className="mb-0" label="Shipping Address" name="address">
              <Input
                className=""
                placeholder="Enter shipping address"
                size={"small"}
              />
            </Form.Item>

            <Form.Item className="mb-0" label="Note" name="note">
              <Input
                className=""
                size={"small"}
                placeholder="Write sale Note"
                label="note"
              />
            </Form.Item>

            <Form.Item
              className="mb-0"
              label={
                <>
                  Terms and conditions
                  {selectedTermsAndConditions && (
                    <button
                      onClick={() => setSelectedTermsAndConditions(false)}
                      className="py-1 px-2 bg-red-200 rounded ml-1 text-gray-500">
                      Cancel
                    </button>
                  )}
                  <BigDrawer title={"New Terms and conditions"}>
                    <AddTermsAndConditions drawer={true} />
                  </BigDrawer>
                </>
              }
              name="termsAndConditions">
              {selectedTermsAndConditions ? (
                <Input.TextArea
                  onChange={(value) => setSelectedTermsAndConditions(value)}
                  value={selectedTermsAndConditions}
                />
              ) : (
                <Select
                  className="w-full"
                  loading={loading}
                  showSearch
                  value={selectedTermsAndConditions}
                  placeholder="Select Terms and conditions"
                  onSelect={(value) => setSelectedTermsAndConditions(value)}>
                  {termsAndConditions &&
                    termsAndConditions?.map((info) => (
                      <Option key={info.id} value={info.subject}>
                        {info.title}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </div>

          <div className="bg-gray-100 px-2">
            <div className="py-2">
              <div className=" flex justify-between">
                <strong>Total amount: </strong>
                <strong>{Number(total).toFixed(2)} </strong>
              </div>
              <div className=" flex justify-between">
                <span>Total discount: </span>
                <span>{Number(totalDiscount).toFixed(2)} </span>
              </div>

              <div className="py-1 flex justify-between items-center mb-1">
                <span>Total tax amount: </span>
                <span>{Number(totalTaxAmount).toFixed(2)}</span>
              </div>
              <div className="py-1 flex justify-between items-center mb-1">
                <strong>Total Payable: </strong>

                <strong>{Number(totalPayable).toFixed(2)}</strong>
              </div>
              <div className="py-1 mb-1 flex justify-between">
                <strong>Due Amount:</strong>
                <strong>{due.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span className="">Paid Amount: </span>
                <div className="w-[65%] flex items-center justify-between gap-2">
                  <Payments totalCalculator={totalCalculator} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Form.Item className="w-full pb-0">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  loading={loader}
                  onClick={() => setLoader(true)}>
                  Create Sale
                </Button>
              </Form.Item>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AddSale;
