import { Layout } from "antd";
import styles from "./Header.module.css";

const { Header } = Layout;

interface HeaderPageProps {
    siderCollapsed?: boolean;
}

const HeaderPage: React.FC<HeaderPageProps> = ({ siderCollapsed = false }) => {
    return (
        <Header 
            className={styles.header}
            style={{
                left: siderCollapsed ? '80px' : '200px',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
        </Header>
    );
}

export default HeaderPage;