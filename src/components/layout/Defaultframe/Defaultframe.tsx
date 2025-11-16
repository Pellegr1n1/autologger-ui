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
  // Sider inicia fechado, mas pode abrir em telas maiores
  const [siderCollapsed, setSiderCollapsed] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const handleSiderCollapse = (collapsed: boolean) => {
    // Permitir mudança apenas se a tela for grande o suficiente
    // A verificação é feita no VehicleSider
    setSiderCollapsed(collapsed);
  };

  // Efeito para gerenciar o estado de carregamento do conteúdo
  useEffect(() => {
    if (loading) {
      setContentLoading(true);
    } else {
      // Delay pequeno para transição suave
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
            marginTop: '0',
            marginLeft: showSider ? (siderCollapsed ? '80px' : '200px') : '0',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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