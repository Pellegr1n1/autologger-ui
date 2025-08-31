import { DeleteOutlined, DollarOutlined, EditOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"

export function createMenuItems(
    onEdit: () => void,
    onSell: () => void,
    onDelete: () => void
): MenuProps["items"] {
    return [
        {
            key: "edit",
            icon: <EditOutlined />,
      label: "Editar dados",
            onClick: onEdit,
        },
        {
            key: "sell",
            icon: <DollarOutlined />,
      label: "Marcar como vendido",
            onClick: onSell,
        },
        { type: "divider" as const },
        {
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
      label: "Excluir",
            onClick: onDelete,
        },
    ]
}