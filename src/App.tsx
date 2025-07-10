import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
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
          colorBgContainer: 'var(--card-background)',
          colorBgBase: 'var(--background-color)',
          colorText: 'var(--text-dark)',
          borderRadius: 8,
          fontFamily: 'inherit',
        },
        components: {
          Layout: {
            siderBg: 'var(--primary-color)',
            headerBg: 'var(--card-background)',
            bodyBg: 'var(--card-background)',
            headerHeight: 64,
            headerPadding: '0 24px',
            headerColor: 'var(--text-dark)',
          },
          Menu: {
            darkItemBg: 'var(--primary-color)',
            darkItemSelectedBg: 'rgba(255, 255, 255, 0.15)',
            darkItemSelectedColor: 'white',
            darkSubMenuItemBg: 'var(--primary-color)',
            darkPopupBg: 'var(--primary-color)',
            itemColor: 'rgba(255, 255, 255, 0.65)',
            itemHoverColor: 'white',
            itemSelectedColor: 'white',
          },
          Table: {
            headerBg: 'var(--primary-color)',
            headerColor: 'white',
            headerBorderRadius: 8,
            rowHoverBg: 'var(--gray-1)',
            borderColor: 'var(--gray-3)',
            headerSplitColor: 'transparent',
          },
          Button: {
            defaultHoverBg: 'var(--gray-2)',
            defaultHoverColor: 'var(--primary-color)',
            defaultHoverBorderColor: 'var(--primary-color)',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: 'var(--shadow-md)',
            colorBorderSecondary: 'var(--gray-2)',
          }
        },
      }}
    >
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;