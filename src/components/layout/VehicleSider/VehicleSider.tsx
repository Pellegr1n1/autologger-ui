import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CarOutlined, 
  ToolOutlined, 
  BarChartOutlined, 
  UserOutlined, 
  LogoutOutlined,
  BlockOutlined
} from "@ant-design/icons";
import { FiMenu } from "react-icons/fi";
import { Layout, Menu, Button, Divider } from "antd";
import type { MenuProps } from "antd";
import styles from './Sider.module.css';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

interface VehicleSiderProps {
    onCollapseChange?: (collapsed: boolean) => void;
}

const VehicleSider: React.FC<VehicleSiderProps> = ({ onCollapseChange }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const items: MenuItem[] = [
        getItem("Veículos", "/vehicles", <CarOutlined />),
        getItem("Serviços", "/maintenance", <ToolOutlined />),
        getItem("Blockchain", "/blockchain", <BlockOutlined />),
        getItem("Relatórios", "/reports", <BarChartOutlined />),
        getItem("Perfil", "/profile", <UserOutlined />)
    ];

    // Determinar qual item está ativo baseado na rota atual
    const getActiveKey = () => {
        const path = location.pathname;
        if (path === "/") return ["/"];
        if (path.startsWith("/vehicles")) return ["/vehicles"];
        if (path.startsWith("/maintenance")) return ["/maintenance"];
        if (path.startsWith("/reports")) return ["/reports"];
        if (path.startsWith("/profile")) return ["/profile"];
        if (path.startsWith("/blockchain")) return ["/blockchain"];
        return ["/"];
    };

    return (
        <Sider
            className={styles.sider}
            style={{
                position: "fixed",
                height: "100%",
                zIndex: "1000",
                background: "var(--surface-color)",
                borderRight: "1px solid rgba(139, 92, 246, 0.1)"
            }}
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={200}
            collapsedWidth={80}
        >
                    <div className={collapsed ? styles.btn_menu_center : styles.btn_menu_start}>
            <Button
                type="text"
                icon={<FiMenu size={20} />}
                onClick={() => {
                    const newCollapsed = !collapsed;
                    setCollapsed(newCollapsed);
                    onCollapseChange?.(newCollapsed);
                }}
                style={{ 
                    color: 'var(--text-primary)',
                    background: 'transparent'
                }}
            />
            {!collapsed && <span className={styles.menu}>AutoLogger</span>}
        </div>
            <Divider className={styles.divider} />
            <Menu
                onClick={({ key }) => handleMenuClick(key as string)}
                selectedKeys={getActiveKey()}
                mode="inline"
                items={items}
                theme="light"
                style={{
                    background: "var(--surface-color)",
                    border: "none"
                }}
            />
            
            {/* Botão de Logout no final */}
            <div style={{ 
                position: 'absolute', 
                bottom: '24px', 
                left: '0', 
                right: '0',
                padding: '0 16px'
            }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : '12px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {!collapsed && <span>Sair</span>}
                </Button>
            </div>
        </Sider>
    );
};

export default VehicleSider;
