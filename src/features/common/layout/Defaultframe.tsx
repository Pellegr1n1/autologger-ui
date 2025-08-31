import React, { ReactNode, useState } from "react";
import { Layout } from "antd";
import HeaderPage from "./Header";
import VehicleSider from "./VehicleSider";
import styles from "./styles/Defaultframe.module.css";

interface DefaultFrameProps {
  title?: string;
  children: ReactNode;
  breadcrumb?: ReactNode;
  showSider?: boolean;
  showHeader?: boolean;
}

export default function DefaultFrame({
  children,
  title,
  breadcrumb,
  showSider = true,
  showHeader = true
}: DefaultFrameProps): React.JSX.Element {
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const handleSiderCollapse = (collapsed: boolean) => {
    setSiderCollapsed(collapsed);
  };

  return (
    <Layout className={styles.mainLayout}>
      {showSider && <VehicleSider onCollapseChange={handleSiderCollapse} />}
      <Layout>
        {showHeader && <HeaderPage siderCollapsed={siderCollapsed} />}
        <Layout 
          className={styles.contentLayout}
          style={{
            marginTop: showHeader ? '72px' : '0',
            marginLeft: showSider ? (siderCollapsed ? '80px' : '200px') : '0',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
          {title && <h1 className={styles.title}>{title}</h1>}
          <div className={styles.content}>
            {children}
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
}