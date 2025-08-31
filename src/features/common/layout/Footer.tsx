import { Row, Col, Typography, Button } from "antd"
import { GithubOutlined, LinkedinOutlined } from "@ant-design/icons"
import styles from "./styles/Footer.module.css"

const { Title, Text } = Typography

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <Row gutter={[48, 32]} justify="center" align="top">
            <Col xs={12} sm={8} md={4} lg={4}>
              <div className={styles.linksSection}>
                <Title level={4} className={styles.sectionTitle}>
                  Links Rápidos
                </Title>
                <ul className={styles.linksList}>
                  <li>
                    <a href="#features" className={styles.link}>
                      Recursos
                    </a>
                  </li>
                  <li>
                    <a href="#about" className={styles.link}>
                      Sobre Nós
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className={styles.link}>
                      Preços
                    </a>
                  </li>
                </ul>
              </div>
            </Col>

            <Col xs={12} sm={8} md={4} lg={4}>
              <div className={styles.linksSection}>
                <Title level={4} className={styles.sectionTitle}>
                  Legal
                </Title>
                <ul className={styles.linksList}>
                  <li>
                    <a href="#privacy" className={styles.link}>
                      Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#terms" className={styles.link}>
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href="#cookies" className={styles.link}>
                      Cookies
                    </a>
                  </li>
                  <li>
                    <a href="#security" className={styles.link}>
                      Segurança
                    </a>
                  </li>
                </ul>
              </div>
            </Col>

            <Col xs={24} sm={8} md={4} lg={4}>
              <div className={styles.socialSection}>
                <Title level={4} className={styles.sectionTitle}>
                  Redes Sociais
                </Title>
                <div className={styles.socialLinks}>
                  <Button
                    type="text"
                    icon={<GithubOutlined />}
                    className={styles.socialButton}
                    href="https://github.com/Pellegr1n1"
                    size="large"
                  />
                  <Button
                    type="text"
                    icon={<LinkedinOutlined />}
                    className={styles.socialButton}
                    href="https://www.linkedin.com/in/leandro-pellegrini-fodi-1a15ba210/"
                    size="large"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className={styles.bottomBar}>
          <Row justify="center" align="middle" className={styles.bottomContent}>
            <Col xs={24}>
              <div className={styles.copyrightCenter}>
                <Text className={styles.copyright}>
                  &copy; {new Date().getFullYear()} AutoLogger. Todos os direitos reservados.
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </footer>
  )
}
