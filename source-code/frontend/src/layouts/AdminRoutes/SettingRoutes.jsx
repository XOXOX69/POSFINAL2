import Loader from "@/components/loader/loader";
import PermissionChecker from "@/components/PrivacyComponent/PermissionChecker";
import AppSettings from "@/components/settings/AppSettings/AppSettings";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const AddDetails = lazy(() => import("@/components/settings/addDetails"));
const CfdAdsSettings = lazy(() => import("@/components/settings/CfdAdsSettings"));
const ModifierManagement = lazy(() => import("@/components/settings/ModifierManagement"));
const CashDrawerManagement = lazy(() => import("@/components/settings/CashDrawerManagement"));

export default function SettingRoutes() {
  return (
    <Routes>
      <Route
        path="/app-settings"
        exact
        element={
          <Suspense fallback={<Loader />}>
            <PermissionChecker permission={"readAll-setting"}>
              <AppSettings />
            </PermissionChecker>
          </Suspense>
        }
        key="settings"
      />
      ,
      <Route
        path="/company-setting"
        exact
        element={
          <Suspense fallback={<Loader />}>
            <PermissionChecker permission={"readAll-setting"}>
              <AddDetails />
            </PermissionChecker>
          </Suspense>
        }
        key="company-setting"
      />
      ,
      <Route
        path="/cfd-ads"
        exact
        element={
          <Suspense fallback={<Loader />}>
            <PermissionChecker permission={"readAll-setting"}>
              <CfdAdsSettings />
            </PermissionChecker>
          </Suspense>
        }
        key="cfd-ads"
      />
      ,
      <Route
        path="/modifiers"
        exact
        element={
          <Suspense fallback={<Loader />}>
            <PermissionChecker permission={"create-product"}>
              <ModifierManagement />
            </PermissionChecker>
          </Suspense>
        }
        key="modifiers"
      />
      ,
      <Route
        path="/cash-drawer"
        exact
        element={
          <Suspense fallback={<Loader />}>
            <PermissionChecker permission={"readAll-saleInvoice"}>
              <CashDrawerManagement />
            </PermissionChecker>
          </Suspense>
        }
        key="cash-drawer"
      />
      ,
    </Routes>
  );
}
