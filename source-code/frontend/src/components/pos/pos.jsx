/* eslint-disable no-extra-boolean-cast */
import { Button, Form } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { loadAllVatTax } from "../../redux/rtk/features/vatTax/vatTaxSlice";
import { updateCustomerDisplay, clearCustomerDisplay } from "../../redux/rtk/features/customerDisplay/customerDisplaySlice";
import AddPos from "./AddPos";
import PaymentForm from "./PaymentForm";
import ProductsForSale from "./ProductsForSale";
// import PosToolbar from "./PosToolbar";
// import "./pos-dark.css";

const Pos = (props) => {
  const isLogged = Boolean(localStorage.getItem("isLogged"));
  // Form Function
  const [form] = Form.useForm();
  const paymentForm = Form.useForm()[0];
  const dispatch = useDispatch();

  const [selectedProduct, setSelectedProduct] = useState([]);

  const [subTotal, setSubTotal] = useState([]);
  const [due, setDue] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { list: vatTaxList, loading: vatTaxLoading } = useSelector(
    (state) => state.vatTax
  );
  // const { validList, loading: validLoading } = useSelector(
  //   (state) => state.coupon
  // );
  useEffect(() => {
    dispatch(loadAllVatTax());
  }, [dispatch]);
  if (!isLogged) {
    return <Navigate to={"/auth/login"} replace={true} />;
  }
  // total calculate
  const totalCalculator = () => {
    const productArray = form.getFieldValue("saleInvoiceProduct");

    const subTotal =
      productArray?.reduce((subTotal, current) => {
        const quantity = current?.productQuantity || 0;
        const price = current?.productSalePrice || 0;
        let discount = current?.productDiscount || 0;
        if (current?.discountType === "percentage") {
          discount = (price * quantity * current?.productDiscount) / 100;
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
    const paidAmountArray = paymentForm.getFieldValue("paidAmount") || [];
    const paidAmount = paidAmountArray?.reduce((acc, item) => {
      return acc + (item.amount ? parseInt(item.amount) : 0);
    }, 0);
    const due = totalPayable - paidAmount;
    setDue(due);

    // Update customer display for second screen
    if (productArray && productArray.length > 0) {
      const displayItems = productArray.map((item, index) => ({
        id: item.productId || index,
        name: item.productName || 'Unknown Product',
        quantity: item.productQuantity || 0,
        price: item.productSalePrice || 0,
        discount: subTotal[index]?.subDiscount || 0,
        subtotal: subTotal[index]?.subPrice || 0,
      }));

      dispatch(updateCustomerDisplay({
        items: displayItems,
        subtotal: total,
        tax: totalTaxAmount,
        discount: subTotal.reduce((acc, item) => acc + (item.subDiscount || 0), 0),
        total: totalPayable,
      }));
    } else {
      dispatch(clearCustomerDisplay());
    }
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
    <div className={`relative`}>
      <div className="h-full min-h-[calc(100vh-160px)] relative pb-2">
        <div className="flex flex-col xl:flex-row gap-3 h-full">
          <div className={`2xl:w-2/5 xl:w-1/2 p-2 bg-[#F1F1F1] h-full rounded-lg`}>
            <ProductsForSale
              setSelectedProduct={setSelectedProduct}
              form={form}
              totalCalculator={totalCalculator}
            />
          </div>

          <div className="2xl:w-3/5 xl:w-1/2 p-5">
            <AddPos
              form={form}
              setSelectedProduct={setSelectedProduct}
              selectedProduct={selectedProduct}
              totalCalculator={totalCalculator}
              subTotal={subTotal}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </div>

        <PaymentForm
          form={paymentForm}
          isModalOpen={isModalOpen}
          productForm={form}
          setIsModalOpen={setIsModalOpen}
          due={due}
          total={total}
          totalPayable={totalPayable}
          totalTaxAmount={totalTaxAmount}
          totalDiscount={totalDiscount}
          totalCalculator={totalCalculator}
          vatTaxList={vatTaxList}
          vatTaxLoading={vatTaxLoading}
          // validList={validList}
          // validLoading={validLoading}
        />
      </div>
        <div className={`sticky bottom-0 right-0 w-full border rounded bg-white p-2 px-5 mt-3 z-10`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`font-medium md:font-semibold text-lg`}>
              Net Total
            </span>
            :{" "}
            <span className={`font-bold text-base lg:text-xl`}>
              ₱{totalPayable.toFixed(2)}
            </span>
          </div>
          <div>
            <Button onClick={() => form.submit()} type="primary" size="large">
              <strong>Continue Sale</strong>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;
