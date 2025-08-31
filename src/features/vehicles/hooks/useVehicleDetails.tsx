import React from "react"
import { Modal, message } from "antd"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import type { VehicleEvent, VehicleDocument } from "../types/vehicle.types"

interface UseVehicleDetailsProps {
  events: VehicleEvent[]
  documents: VehicleDocument[]
  setEvents: React.Dispatch<React.SetStateAction<VehicleEvent[]>>
  setDocuments: React.Dispatch<React.SetStateAction<VehicleDocument[]>>
  vehicleId: string
}

export function useVehicleDetails({
  events,
  documents,
  setEvents,
  setDocuments,
  vehicleId
}: UseVehicleDetailsProps) {
  const [serviceModalOpen, setServiceModalOpen] = React.useState(false)

  // Vehicle handlers
  const handleEditVehicle = () => {
    message.info("Ação de editar")
  }

  const handleSellVehicle = () => {
    Modal.confirm({
      title: "Confirmar venda",
      icon: <ExclamationCircleOutlined />,
      content: "Deseja marcar este veículo como vendido?",
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk() {
        message.success("Veículo marcado como vendido (mock).")
      },
    })
  }

  const handleDeleteVehicle = () => {
    Modal.confirm({
      title: "Excluir veículo",
      icon: <ExclamationCircleOutlined />,
      content: "Esta ação não poderá ser desfeita.",
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk() {
        message.success("Veículo excluído (mock).")
      },
    })
  }

  const handleEditEvent = (event: VehicleEvent) => {
    message.info(`Editar evento ${event.id}`)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    message.success("Evento removido.")
  }

  const handleAddEvent = (newEvent: VehicleEvent) => {
    const eventWithId: VehicleEvent = {
      ...newEvent,
      id: `evt-${Date.now()}`,
    }
    setEvents((prev) => [eventWithId, ...prev])
    message.success("Evento adicionado.")
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    message.success("Documento removido.")
  }

  const handleUploadDocument = (file: File) => {
    const newDoc: VehicleDocument = {
      id: `doc-${Date.now()}`,
      vehicleId: vehicleId,
      name: file.name,
      type: file.type,
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: file.size,
      url: "#",
    }
    setDocuments((prev) => [newDoc, ...prev])
    message.success(`Arquivo '${file.name}' anexado (mock).`)
    return false
  }

  const handleOpenServiceModal = () => {
    setServiceModalOpen(true)
  }

  const handleCloseServiceModal = () => {
    setServiceModalOpen(false)
  }

  return {
    serviceModalOpen,
    handleEditVehicle,
    handleSellVehicle,
    handleDeleteVehicle,
    handleEditEvent,
    handleDeleteEvent,
    handleAddEvent,
    handleDeleteDocument,
    handleUploadDocument,
    handleOpenServiceModal,
    handleCloseServiceModal,
  }
}