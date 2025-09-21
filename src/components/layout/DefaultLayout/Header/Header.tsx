import { Layout, Dropdown, MenuProps } from "antd";
import { FaUserAlt } from "react-icons/fa";
import styles from "./Header.module.css";

const { Header } = Layout;

const user: MenuProps['items'] = [
    {
        key: '1',
        label: (
            <div className={styles.userProfile}>
                <span>Perfil</span>
            </div>
        ),
        onClick: () => {
            // TODO: Implementar navegação para perfil
        },
    },
];

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
            </div>
            <img alt="Logo" width={60} />
        </Header>
    );
}

export default HeaderPage;