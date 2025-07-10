import React, { ReactNode } from "react";
import { Layout } from "antd";
import HeaderPage from "./Header";
import SiderPage from "./Sider";
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
  return (
    <Layout className={styles.mainLayout}>
      {showSider && <SiderPage />}
      <Layout>
        {showHeader && <HeaderPage />}
        <Layout 
          className={styles.contentLayout}
          style={{
            marginTop: showHeader ? '104px' : '0',
            marginLeft: showSider ? '120px' : '0',
            marginRight: '80px'
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