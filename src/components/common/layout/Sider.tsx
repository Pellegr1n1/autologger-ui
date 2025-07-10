import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaUserPlus } from "react-icons/fa";
import { FaRegCalendarPlus, FaGear, FaLaptop, FaUsers as FaClass, FaUser, FaBook } from "react-icons/fa6";
import { FiMenu } from "react-icons/fi";
import { Layout, Menu, Button, Divider } from "antd";
import type { MenuProps } from "antd";
import styles from './styles/Sider.module.css';

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

const SiderPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const navigate = useNavigate();
    const userRole = Number(localStorage.getItem("role_id"));

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const items: MenuItem[] = [
        getItem("Portal", "/portal", <FaLaptop />),
        ...(userRole === 2
            ? [
                getItem("Quadro de Horários", "/timetable", <FaRegCalendarPlus />),
                getItem("Inscrição", "/registration", <FaUserPlus />),
            ]
            : []),

        ...(userRole === 1
            ? [getItem("Turmas", "/class", <FaClass />)]
            : []),

        ...(userRole === 3
            ? [
                getItem("Quadro de Horários", "/timetable", <FaRegCalendarPlus />),
                getItem("Inscrição", "/registration", <FaUserPlus />),
                getItem("Turmas", "/class", <FaClass />),
                getItem("Registrar", "/register", <FaUsers />, [
                    getItem(collapsed ? "Registrar Usuário" : "Usuário", "/register/user", <FaUser />),
                    getItem(collapsed ? "Registrar Turma" : "Turma", "/register/class", <FaBook />),
                ]),
            ]
            : []),
        getItem("Configurações", "/setting", <FaGear />),
    ];

    return (
        <Sider
            style={{
                position: "fixed",
                height: "100%",
                zIndex: "1000",
            }}
            collapsible
            collapsed={collapsed}
            trigger={null}
        >
            <div className={collapsed ? styles.btn_menu_center : styles.btn_menu_start}>
                <Button
                    type="text"
                    icon={<FiMenu size={20} />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ color: 'white' }}
                />
                {!collapsed && <span className={styles.menu}>Menu</span>}
            </div>
            <Divider className={styles.divider} />
            <Menu
                onClick={({ key }) => handleMenuClick(key as string)}
                defaultSelectedKeys={[window.location.pathname]}
                mode="inline"
                items={items}
                theme={"dark"}
            />
        </Sider>
    );
};

export default SiderPage;