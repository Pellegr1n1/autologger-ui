import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./features/auth";
import Router from "./app/router/Router";
import "./styles/globals.css";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8B5CF6',
          colorInfo: '#A78BFA',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',

          colorBgContainer: '#161B22',
          colorBgBase: '#0D1117',
          colorBgLayout: '#0D1117',

          colorText: '#F9FAFB',
          colorTextSecondary: '#6B7280',
          colorTextTertiary: '#6B7280',
          colorTextQuaternary: '#6B7280',

          colorBorder: '#6B7280',
          colorBorderSecondary: '#161B22',

          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,

          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          fontSizeLG: 16,
          fontSizeSM: 12,
          lineHeight: 1.6,
          lineHeightLG: 1.5,

          boxShadow:
            '0 1px 3px 0 rgba(139, 92, 246, 0.1), 0 1px 2px -1px rgba(139, 92, 246, 0.1)',
          boxShadowSecondary:
            '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -2px rgba(139, 92, 246, 0.1)',
          boxShadowTertiary:
            '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -4px rgba(139, 92, 246, 0.1)',
        },
        components: {
          Layout: {
            siderBg: '#161B22',
            headerBg: '#161B22',
            bodyBg: '#0D1117',
            headerHeight: 64,
            headerPadding: '0 24px',
            headerColor: '#F9FAFB',
            triggerBg: '#8B5CF6',
            triggerColor: '#F9FAFB',
          },
          Menu: {
            darkItemBg: '#161B22',
            darkItemSelectedBg: 'rgba(139, 92, 246, 0.15)',
            darkItemSelectedColor: '#F9FAFB',
            darkSubMenuItemBg: '#0D1117',
            darkPopupBg: '#161B22',
            itemColor: 'rgba(249, 250, 251, 0.75)',
            itemHoverColor: '#F9FAFB',
            itemSelectedColor: '#F9FAFB',

            itemBg: 'transparent',
            itemSelectedBg: '#0D1117',
            itemHoverBg: '#161B22',
            subMenuItemBg: '#0D1117',
          },
          Modal: {
            contentBg: '#161B22',
            headerBg: '#161B22',
            titleColor: '#F9FAFB',
            colorText: '#F9FAFB',
            colorTextHeading: '#F9FAFB',
            colorIcon: '#6B7280',
            colorIconHover: '#A78BFA',
            borderRadiusLG: 12,
          },
          Form: {
            labelColor: '#F9FAFB',
            labelRequiredMarkColor: '#EF4444',
            itemMarginBottom: 24,
          },
          Input: {
            colorText: '#F9FAFB',
            colorTextPlaceholder: '#6B7280',
            colorBorder: '#6B7280',
            colorBgContainer: '#0D1117',
            borderRadius: 8,
            paddingBlock: 10,
            paddingInline: 12,
            hoverBorderColor: '#A78BFA',
            activeBorderColor: '#8B5CF6',
          },
          Select: {
            colorText: '#F9FAFB',
            colorTextPlaceholder: '#6B7280',
            colorBorder: '#6B7280',
            colorBgContainer: '#0D1117',
            borderRadius: 8,
            optionSelectedBg: '#161B22',
            optionActiveBg: '#161B22',
            optionSelectedColor: '#F9FAFB',
          },
          InputNumber: {
            colorText: '#F9FAFB',
            colorTextPlaceholder: '#6B7280',
            colorBorder: '#6B7280',
            colorBgContainer: '#0D1117',
            borderRadius: 8,
            paddingBlock: 10,
            paddingInline: 12,
            hoverBorderColor: '#A78BFA',
            activeBorderColor: '#8B5CF6',
          },
          Alert: {
            colorIcon: '#A78BFA',
            colorInfoBg: 'rgba(167, 139, 250, 0.1)',
            colorInfoBorder: '#A78BFA',
            borderRadiusLG: 8,
          },
          Typography: {
            titleMarginTop: 0,
            titleMarginBottom: 16,
            colorText: '#F9FAFB',
            colorTextHeading: '#F9FAFB',
            colorTextSecondary: '#6B7280',
            colorTextDescription: '#6B7280',
          },
          Button: {
            colorText: '#F9FAFB',
            colorBorder: '#8B5CF6',
            colorBgContainer: '#8B5CF6',
            borderRadius: 8,
            defaultHoverBg: '#A78BFA',
            defaultHoverColor: '#F9FAFB',
            defaultHoverBorderColor: '#A78BFA',
            defaultActiveBg: '#7C3AED',
            defaultActiveBorderColor: '#7C3AED',
            primaryColor: '#F9FAFB',
          },
          Table: {
            headerBg: '#161B22',
            headerColor: '#F9FAFB',
            headerBorderRadius: 8,
            rowHoverBg: '#0D1117',
            borderColor: '#6B7280',
            headerSplitColor: 'transparent',
            colorText: '#F9FAFB',
            colorTextHeading: '#F9FAFB',
          },
          Card: {
            colorText: '#F9FAFB',
            colorTextHeading: '#F9FAFB',
            colorTextDescription: '#6B7280',
            borderRadiusLG: 12,
            boxShadowTertiary:
              '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -2px rgba(139, 92, 246, 0.1)',
            colorBorderSecondary: '#6B7280',
            colorBgContainer: '#161B22',
          },
          Badge: {
            colorText: '#F9FAFB',
            colorBorderBg: '#F9FAFB',
          },
          Tag: {
            colorText: '#F9FAFB',
            borderRadiusSM: 12,
          },
          Dropdown: {
            colorText: '#F9FAFB',
            colorBgElevated: '#161B22',
            borderRadiusOuter: 8,
            boxShadowSecondary:
              '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -4px rgba(139, 92, 246, 0.1)',
          },
          Tabs: {
            colorText: '#A78BFA',
            colorTextHeading: '#F9FAFB',
            itemColor: '#6B7280',
            itemSelectedColor: '#A78BFA',
            itemHoverColor: '#A78BFA',
            itemActiveColor: '#F9FAFB',
            inkBarColor: '#A78BFA',
            borderRadius: 6,
          },
          DatePicker: {
            colorText: '#F9FAFB',
            colorTextPlaceholder: '#6B7280',
            colorBorder: '#6B7280',
            colorBgContainer: '#0D1117',
            borderRadius: 8,
            hoverBorderColor: '#A78BFA',
            activeBorderColor: '#8B5CF6',
            // Cores para seleção de datas
            colorPrimary: '#8B5CF6',
            colorPrimaryHover: '#A78BFA',
            colorPrimaryActive: '#7C3AED',
          },
          Calendar: {
            colorBgContainer: '#161B22',
            colorBgBase: '#0D1117',
            colorText: '#F9FAFB',
            colorTextSecondary: '#6B7280',
            colorPrimary: '#8B5CF6',
            colorPrimaryHover: '#A78BFA',
            colorPrimaryActive: '#7C3AED',
            colorBgTextHover: 'rgba(139, 92, 246, 0.1)',
            colorBgTextActive: 'rgba(139, 92, 246, 0.15)',
          },
          Pagination: {
            colorText: '#F9FAFB',
            colorTextDisabled: '#6B7280',
            colorBgTextHover: '#161B22',
            colorBgTextActive: '#161B22',
            borderRadius: 6,
          },
          Switch: {
            colorPrimary: '#8B5CF6',
            colorPrimaryHover: '#A78BFA',
          },
          Checkbox: {
            colorPrimary: '#8B5CF6',
            colorPrimaryHover: '#A78BFA',
          },
          Radio: {
            colorPrimary: '#8B5CF6',
            colorPrimaryHover: '#A78BFA',
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
