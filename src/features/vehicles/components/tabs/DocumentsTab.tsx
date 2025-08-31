import React from "react"
import { Card, Col, Row, Table, Upload, Space, Typography, Statistic, Progress, Tag } from "antd"
import { 
  CloudUploadOutlined, 
  FileTextOutlined, 
  FilePdfOutlined, 
  FileImageOutlined,
  DeleteOutlined,
  DownloadOutlined
} from "@ant-design/icons"
import type { VehicleDocument } from "../../types/vehicle.types"
import { createDocumentColumns } from "../../utils/tableColumns"

const { Text, Title } = Typography

interface DocumentsTabProps {
  documents: VehicleDocument[]
  onDelete: (docId: string) => void
  onUpload: (file: File) => boolean
}

export default function DocumentsTab({ 
  documents, 
  onDelete, 
  onUpload 
}: DocumentsTabProps) {
  const documentColumns = createDocumentColumns(onDelete)

  // Calcular estatísticas dos documentos
  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const pdfCount = documents.filter(doc => doc.type === 'application/pdf').length;
  const imageCount = documents.filter(doc => doc.type.startsWith('image/')).length;
  const otherCount = totalDocuments - pdfCount - imageCount;

  // Calcular tamanho médio
  const averageSize = totalDocuments > 0 ? totalSize / totalDocuments : 0;

  // Formatar tamanho em MB
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Calcular uso de espaço (placeholder)
  const storageUsage = Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100); // 100MB como limite

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Cards de estatísticas */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Total de Documentos</Text>}
              value={totalDocuments}
              prefix={<FileTextOutlined style={{ color: 'white' }} />}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '24px' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Espaço Utilizado</Text>}
              value={formatSize(totalSize)}
              prefix={<CloudUploadOutlined style={{ color: 'white' }} />}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '20px' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>PDFs</Text>}
              value={pdfCount}
              prefix={<FilePdfOutlined style={{ color: 'white' }} />}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '24px' 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Imagens</Text>}
              value={imageCount}
              prefix={<FileImageOutlined style={{ color: 'white' }} />}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '24px' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Área de upload e informações */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CloudUploadOutlined style={{ color: '#8B5CF6' }} />
                <span>Upload de Documentos</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <Upload.Dragger
              multiple
              showUploadList={false}
              beforeUpload={onUpload}
              style={{ 
                width: '100%',
                background: '#374151',
                border: '2px dashed #6B7280',
                borderRadius: '12px'
              }}
            >
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <CloudUploadOutlined style={{ fontSize: '48px', color: '#8B5CF6', marginBottom: '16px' }} />
                <Text style={{ display: 'block', color: '#F9FAFB', fontSize: '16px', marginBottom: '8px' }}>
                  Arraste arquivos ou clique para enviar
                </Text>
                <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                  Suporta PDF, JPG, PNG e outros formatos
                </Text>
                <div style={{ marginTop: '16px' }}>
                  <Tag color="blue" style={{ marginRight: '8px' }}>PDF</Tag>
                  <Tag color="green" style={{ marginRight: '8px' }}>JPG</Tag>
                  <Tag color="orange">PNG</Tag>
                </div>
              </div>
            </Upload.Dragger>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#8B5CF6' }} />
                <span>Informações de Armazenamento</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Uso de espaço</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={storageUsage} 
                    strokeColor={{
                      '0%': '#8B5CF6',
                      '100%': '#A78BFA'
                    }}
                    trailColor="#374151"
                    size="small"
                  />
                </div>
                <Text style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {formatSize(totalSize)} de 100 MB
                </Text>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Tamanho médio por arquivo</Text>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                    {formatSize(averageSize)}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Tipos de arquivo</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space wrap>
                    <Tag color="red" icon={<FilePdfOutlined />}>
                      {pdfCount} PDFs
                    </Tag>
                    <Tag color="green" icon={<FileImageOutlined />}>
                      {imageCount} Imagens
                    </Tag>
                    {otherCount > 0 && (
                      <Tag color="default">
                        {otherCount} Outros
                      </Tag>
                    )}
                  </Space>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabela de documentos */}
      <Card 
        title={
          <Space>
            <FileTextOutlined style={{ color: '#8B5CF6' }} />
            <span>Documentos Anexados</span>
          </Space>
        }
        style={{ 
          borderRadius: '16px',
          border: '1px solid #374151',
          background: '#1F2937'
        }}
        headStyle={{ 
          borderBottom: '1px solid #374151',
          background: '#1F2937',
          color: '#F9FAFB'
        }}
        bodyStyle={{ background: '#1F2937' }}
      >
        <Table
          rowKey="id"
          dataSource={documents}
          columns={documentColumns}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} documentos`
          }}
          style={{ background: '#1F2937' }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#6B7280', marginBottom: '16px' }} />
                <Text style={{ display: 'block', color: '#6B7280', fontSize: '16px' }}>
                  Nenhum documento anexado
                </Text>
                <Text style={{ color: '#6B7280', fontSize: '14px' }}>
                  Faça upload de documentos para começar
                </Text>
              </div>
            )
          }}
        />
      </Card>
    </Space>
  )
}