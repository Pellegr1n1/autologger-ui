import React from "react";
import { Result, Button, Typography, Space } from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import styles from "./NotFound.module.css";

const { Title, Paragraph } = Typography;

export default function NotFoundPage() {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Result
          icon={<ApiOutlined className={styles.icon} />}
          title={
            <Title level={1} className={styles.title}>
              <span className={styles.titleHighlight}>404</span> - Página não
              encontrada
            </Title>
          }
          subTitle={
            <div className={styles.subtitle}>
              <Paragraph className={styles.description}>
                Ops! Parece que você se perdeu no universo da AutoLogger. A
                página que você está procurando não existe.
              </Paragraph>
            </div>
          }
          extra={
            <Space size="large" className={styles.actions}>
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={handleGoHome}
                className={styles.primaryButton}
              >
                Voltar ao Início
              </Button>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                className={styles.secondaryButton}
              >
                Página Anterior
              </Button>
            </Space>
          }
        />
      </div>
    </div>
  );
}
