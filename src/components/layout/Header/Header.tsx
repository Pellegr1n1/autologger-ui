import { Layout, Dropdown, MenuProps } from "antd";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const { Header } = Layout;

const useUserMenu = (): MenuProps['items'] => {
    const navigate = useNavigate();
    
    return [
        {
            key: '1',
            label: (
                <div className={styles.userProfile}>
                    <span>Perfil</span>
                </div>
            ),
            onClick: () => {
                navigate('/profile');
            },
        },
    ];
};

interface HeaderPageProps {
    siderCollapsed?: boolean;
}

const HeaderPage: React.FC<HeaderPageProps> = ({ siderCollapsed = false }) => {
    const userMenu = useUserMenu();
    
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
                        items: userMenu,
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    className={styles.user}
                >
                    <FaUserAlt size={20} />
                </Dropdown>
            </div>
        </Header>
    );
}

export default HeaderPage;