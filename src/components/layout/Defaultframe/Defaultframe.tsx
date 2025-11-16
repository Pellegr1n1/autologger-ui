import React, { ReactNode, useState, useEffect } from "react";
import { Layout, Spin } from "antd";
import HeaderPage from "../Header/Header";
import VehicleSider from "../VehicleSider/VehicleSider";
import styles from "./Defaultframe.module.css";

interface DefaultFrameProps {
  title?: string;
  children: ReactNode;
  breadcrumb?: ReactNode;
  showSider?: boolean;
  showHeader?: boolean;
  loading?: boolean;
}

export default function DefaultFrame({
  children,
  title,
  breadcrumb,
  showSider = true,
  showHeader = true,
  loading = false
}: DefaultFrameProps): React.JSX.Element {
  const [siderCollapsed, setSiderCollapsed] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);

  const handleSiderCollapse = (collapsed: boolean) => {
    setSiderCollapsed(collapsed);
  };

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (window.innerWidth <= 576) {
        setHeaderHeight(60);
      } else if (window.innerWidth <= 768) {
        setHeaderHeight(64);
      } else {
        setHeaderHeight(72);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    if (loading) {
      setContentLoading(true);
    } else {
      const timer = setTimeout(() => {
        setContentLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Layout className={styles.mainLayout}>
      {showSider && <VehicleSider onCollapseChange={handleSiderCollapse} />}
      <Layout>
        {showHeader && <HeaderPage siderCollapsed={siderCollapsed} />}
        <Layout 
          className={styles.contentLayout}
          style={{
            marginTop: showHeader ? `${headerHeight}px` : '0',
            marginLeft: showSider ? (siderCollapsed ? '80px' : '200px') : '0',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
          {title && <h1 className={styles.title}>{title}</h1>}
          <div className={styles.content}>
            <div className={styles.contentWrapper}>
              <Spin 
                spinning={contentLoading} 
                size="large"
                tip="Carregando..."
                className={styles.contentSpin}
              >
                {children}
              </Spin>
            </div>
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
}