import React from "react";
import { Result, Button, Typography, Space } from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  RocketOutlined,
  SearchOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { ErrorBoundary } from "../../components/common";
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
      {/* Content Overlay */}
      <div className={styles.contentOverlay}>
        <div className={styles.content}>
          {/* Floating Elements */}
          <div className={styles.floatingElements}>
            <div className={styles.floatingIcon}>
              <RocketOutlined />
            </div>
            <div className={styles.floatingIcon}>
              <SearchOutlined />
            </div>
            <div className={styles.floatingIcon}>
              <BulbOutlined />
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.titleContainer}>
              <Title level={1} className={styles.title}>
                <span className={styles.titleHighlight}>404</span>
              </Title>
              <Title level={2} className={styles.subtitle}>
                Página não encontrada
              </Title>
            </div>

                  <div className={styles.descriptionContainer}>
                    <Paragraph className={styles.description}>
                      Ops! Parece que você se perdeu no universo da AutoLogger.
                      A página que você está procurando não existe ou foi movida.
                    </Paragraph>
                  </div>

            {/* Action Buttons */}
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

          </div>
        </div>
      </div>
    </div>
  );
}
