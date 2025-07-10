import { Layout, Divider, Dropdown, MenuProps } from "antd";
import { FaUserAlt } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import styles from "./styles/Header.module.css";

const { Header } = Layout;

const user: MenuProps['items'] = [
    {
        key: '1',
        label: (
            <div className={styles.logout}>
                <CiLogout /><span>Sair</span>
            </div>
        ),
        onClick: () => {
            localStorage.clear();
            window.location.href = '/login';
        },
    },
];

const HeaderPage: React.FC = () => {
    return (
        <Header className={styles.header}>
            <div className={styles.icons}>
                <Dropdown
                    menu={{
                        items: user,
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    className={styles.user}
                >
                    <FaUserAlt size={20} />
                </Dropdown>
                <Divider type="vertical" className={styles.divider} />
            </div>
            <img alt="Logo" width={60} />
        </Header>
    );
}

export default HeaderPage;