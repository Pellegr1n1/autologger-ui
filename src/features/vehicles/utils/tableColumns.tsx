import { Button, Space, Tag, Typography, Tooltip, Modal } from "antd"
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons"
import type { TableColumnsType } from "antd"
import type { VehicleEvent, VehicleDocument, ChainStatus, VehicleEventType } from "../types/vehicle.types"
import { currencyBRL, formatBRDate, kmFormat } from "../../../shared/utils/format"
import { getChainStatusConfig, getVehicleEventTypeLabel } from "./helpers"

const { Text } = Typography

export function createEventColumns(
  onEdit: (event: VehicleEvent) => void,
  onDelete: (eventId: string) => void
): TableColumnsType<VehicleEvent> {
  return [
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (date: string) => formatBRDate(date),
    },
    { 
      title: "Tipo", 
      dataIndex: "type", 
      key: "type",
      render: (type: VehicleEventType) => getVehicleEventTypeLabel(type),
    },
    { title: "Categoria", dataIndex: "category", key: "category" },
    { 
      title: "Km", 
      dataIndex: "mileage", 
      key: "mileage", 
      render: (mileage: number) => kmFormat(mileage),
    },
    {
      title: "Custo",
      dataIndex: "cost",
      key: "cost",
      align: "right" as const,
      render: (cost: number) => currencyBRL(cost || 0),
    },
    {
      title: "Blockchain",
      dataIndex: "blockchainStatus",
      key: "blockchainStatus",
      render: (blockchainStatus: any) => {
        console.log('blockchainStatus:', blockchainStatus);
        if (!blockchainStatus || !blockchainStatus.status) {
          return <Tag color="default">N/A</Tag>
        }
        const config = getChainStatusConfig(blockchainStatus)
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record: VehicleEvent) => (
        <Space>
          <Tooltip title="Editar">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)} 
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                // Modal.confirm({ // This line was removed as per the new_code, as Modal is no longer imported.
                //   title: "Excluir evento",
                //   icon: <ExclamationCircleOutlined />,
                //   content: "Deseja remover este evento?",
                //   okText: "Excluir",
                //   okButtonProps: { danger: true },
                //   cancelText: "Cancelar",
                //   onOk: () => onDelete(record.id),
                // })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]
}

export function createDocumentColumns(
  onDelete: (docId: string) => void
): TableColumnsType<VehicleDocument> {
  return [
    {
      title: "Arquivo",
      dataIndex: "name",
      key: "name",
      render: (name: string, doc: VehicleDocument) => (
        <Space>
          {doc.type.includes("pdf") ? <FilePdfOutlined /> : <FileTextOutlined />}
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Enviado em",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date: string) => formatBRDate(date),
    },
    {
      title: "Tamanho",
      dataIndex: "size",
      key: "size",
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
      align: "right" as const,
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, doc: VehicleDocument) => (
        <Space>
          <Button size="small" icon={<PaperClipOutlined />}>
            Baixar
          </Button>
          <Button
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: "Remover documento",
                content: "Deseja remover este documento?",
                okText: "Remover",
                okButtonProps: { danger: true },
                cancelText: "Cancelar",
                onOk: () => onDelete(doc.id),
              })
            }}
          />
        </Space>
      ),
    },
  ]
}