import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import Router from "./routes/Router";
import "./main.css";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2F54EB',
          colorInfo: '#722ED1',
          colorSuccess: '#52C41A',
          colorWarning: '#FAAD14',
          colorError: '#F5222D',
          colorBgContainer: '#FFFFFF',
          colorBgBase: '#F5F7FA',
          colorText: '#1F1F1F',
          colorTextSecondary: '#595959',
          colorTextTertiary: '#8C8C8C',
          colorTextQuaternary: '#BFBFBF',
          colorBorder: '#D9D9D9',
          colorBorderSecondary: '#F0F0F0',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
        },
        components: {
          Layout: {
            siderBg: '#2F54EB',
            headerBg: '#FFFFFF',
            bodyBg: '#FFFFFF',
            headerHeight: 64,
            headerPadding: '0 24px',
            headerColor: '#1F1F1F',
          },
          Menu: {
            darkItemBg: '#2F54EB',
            darkItemSelectedBg: 'rgba(255, 255, 255, 0.15)',
            darkItemSelectedColor: 'white',
            darkSubMenuItemBg: '#2F54EB',
            darkPopupBg: '#2F54EB',
            itemColor: 'rgba(255, 255, 255, 0.65)',
            itemHoverColor: 'white',
            itemSelectedColor: 'white',
          },
          Modal: {
            contentBg: '#FFFFFF',
            headerBg: '#FFFFFF',
            titleColor: '#1F1F1F',
            colorText: '#1F1F1F',
            colorTextHeading: '#1F1F1F',
            colorIcon: '#8C8C8C',
            colorIconHover: '#595959',
            borderRadiusLG: 12,
          },
          Form: {
            labelColor: '#1F1F1F',
            labelRequiredMarkColor: '#F5222D',
            itemMarginBottom: 24,
          },
          Input: {
            colorText: '#1F1F1F',
            colorTextPlaceholder: '#BFBFBF',
            colorBorder: '#D9D9D9',
            borderRadius: 6,
            paddingBlock: 8,
            paddingInline: 12,
          },
          Select: {
            colorText: '#1F1F1F',
            colorTextPlaceholder: '#BFBFBF',
            colorBorder: '#D9D9D9',
            borderRadius: 6,
            optionSelectedBg: '#F0F5FF',
            optionActiveBg: '#FAFAFA',
          },
          InputNumber: {
            colorText: '#1F1F1F',
            colorTextPlaceholder: '#BFBFBF',
            colorBorder: '#D9D9D9',
            borderRadius: 6,
            paddingBlock: 8,
            paddingInline: 12,
          },
          Alert: {
            colorText: '#1F1F1F',
            colorTextHeading: '#1F1F1F',
            colorIcon: '#1890FF',
            colorInfoBg: '#F0F5FF',
            colorInfoBorder: '#ADC6FF',
            borderRadiusLG: 8,
          },
          Typography: {
            titleMarginTop: 0,
            titleMarginBottom: 16,
            colorText: '#1F1F1F',
            colorTextHeading: '#1F1F1F',
            colorTextSecondary: '#595959',
            colorTextDescription: '#8C8C8C',
          },
          Button: {
            colorText: '#1F1F1F',
            colorBorder: '#D9D9D9',
            borderRadius: 6,
            defaultHoverBg: '#F0F0F0',
            defaultHoverColor: '#2F54EB',
            defaultHoverBorderColor: '#2F54EB',
            defaultActiveBg: '#E6F7FF',
            defaultActiveBorderColor: '#2F54EB',
            defaultActiveColor: '#2F54EB',
          },
          Table: {
            headerBg: '#2F54EB',
            headerColor: 'white',
            headerBorderRadius: 8,
            rowHoverBg: '#FAFAFA',
            borderColor: '#D9D9D9',
            headerSplitColor: 'transparent',
          },
          Card: {
            colorText: '#1F1F1F',
            colorTextHeading: '#1F1F1F',
            borderRadiusLG: 12,
            boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            colorBorderSecondary: '#F0F0F0',
          },
          Badge: {
            colorText: '#FFFFFF',
            colorBorderBg: '#FFFFFF',
          },
          Tag: {
            colorText: '#FFFFFF',
            borderRadiusSM: 12,
          },
          Dropdown: {
            colorText: '#1F1F1F',
            borderRadiusOuter: 8,
            boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;