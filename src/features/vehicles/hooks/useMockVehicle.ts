import React from "react"
import { 
  Vehicle, 
  VehicleEvent, 
  VehicleDocument,
  ChainStatus,
  VehicleEventType,
  VehicleStatus 
} from "../types/vehicle.types"

export function useMockVehicle(id: string) {
  const [events, setEvents] = React.useState<VehicleEvent[]>([
    {
      id: "evt-1",
      vehicleId: id,
      type: VehicleEventType.MAINTENANCE,
      category: "Troca de óleo",
      mileage: 45210,
      date: new Date("2025-05-10"),
      description: "Troca de óleo 5W30 sintético e filtro",
      cost: 320.0,
      location: "Oficina ABC",
      attachments: ["NF_Troca_Oleo_2025-05-10.pdf"],
      createdAt: new Date("2025-05-10"),
      updatedAt: new Date("2025-05-10"),
      
      // Blockchain fields
      blockchainStatus: {
        status: 'CONFIRMED',
        message: 'Confirmado na blockchain',
        lastUpdate: new Date("2025-05-10"),
        retryCount: 0,
        maxRetries: 3
      },
      hash: "0xabc...123",
      previousHash: undefined,
      merkleRoot: "0xmerkle...123",
      isImmutable: true,
      canEdit: false,
      
      // Two-factor confirmation
      requiresConfirmation: true,
      confirmedBy: "user",
      confirmedAt: new Date("2025-05-10"),
      confirmationHash: "0xabc...123"
    },
    {
      id: "evt-2",
      vehicleId: id,
      type: VehicleEventType.OTHER,
      category: "Licenciamento",
      mileage: 45500,
      date: new Date("2025-06-02"),
      description: "Licenciamento anual",
      cost: 180.5,
      location: "DETRAN",
      attachments: [],
      createdAt: new Date("2025-06-02"),
      updatedAt: new Date("2025-06-02"),
      
      // Blockchain fields
      blockchainStatus: {
        status: 'PENDING',
        message: 'Aguardando confirmação blockchain',
        lastUpdate: new Date("2025-06-02"),
        retryCount: 0,
        maxRetries: 3
      },
      hash: undefined,
      previousHash: undefined,
      merkleRoot: undefined,
      isImmutable: false,
      canEdit: true,
      
      // Two-factor confirmation
      requiresConfirmation: true,
      confirmedBy: undefined,
      confirmedAt: undefined,
      confirmationHash: undefined
    },
    {
      id: "evt-3",
      vehicleId: id,
      type: VehicleEventType.REPAIR,
      category: "Pneu",
      mileage: 46880,
      date: new Date("2025-07-15"),
      description: "Substituição de dois pneus dianteiros",
      cost: 1290.9,
      location: "Pneus Brasil",
      attachments: ["Pneus_Nota_2025-07-15.pdf"],
      createdAt: new Date("2025-07-15"),
      updatedAt: new Date("2025-07-15"),
      
      // Blockchain fields
      blockchainStatus: {
        status: 'CONFIRMED',
        message: 'Confirmado na blockchain',
        lastUpdate: new Date("2025-07-15"),
        retryCount: 0,
        maxRetries: 3
      },
      hash: "0xdef...456",
      previousHash: undefined,
      merkleRoot: "0xmerkle...456",
      isImmutable: true,
      canEdit: false,
      
      // Two-factor confirmation
      requiresConfirmation: true,
      confirmedBy: "user",
      confirmedAt: new Date("2025-07-15"),
      confirmationHash: "0xdef...456"
    },
    {
      id: "evt-4",
      vehicleId: id,
      type: VehicleEventType.FUEL,
      category: "Gasolina",
      mileage: 47020,
      date: new Date("2025-07-22"),
      description: "Abastecimento comum (44L)",
      cost: 279.0,
      location: "Posto Shell",
      attachments: [],
      createdAt: new Date("2025-07-22"),
      updatedAt: new Date("2025-07-22"),
      
      // Blockchain fields
      blockchainStatus: {
        status: 'PENDING',
        message: 'Aguardando confirmação blockchain',
        lastUpdate: new Date("2025-07-22"),
        retryCount: 0,
        maxRetries: 3
      },
      hash: undefined,
      previousHash: undefined,
      merkleRoot: undefined,
      isImmutable: false,
      canEdit: true,
      
      // Two-factor confirmation
      requiresConfirmation: true,
      confirmedBy: undefined,
      confirmedAt: undefined,
      confirmationHash: undefined
    },
  ])

  const [documents, setDocuments] = React.useState<VehicleDocument[]>([
    {
      id: "doc-1",
      vehicleId: id,
      name: "NF_Troca_Oleo_2025-05-10.pdf",
      type: "application/pdf",
      uploadedAt: "2025-05-11",
      size: 128_000,
      url: "#",
    },
    {
      id: "doc-2",
      vehicleId: id,
      name: "Pneus_Nota_2025-07-15.pdf",
      type: "application/pdf",
      uploadedAt: "2025-07-16",
      size: 314_572,
      url: "#",
    },
  ])

  const vehicle: Vehicle = {
    id,
    plate: "ABC-1D23",
    brand: "Toyota",
    model: "Corolla XEi",
    year: 2019,
    mileage: 47020,
    color: "Prata",
    renavam: "12345678901",
    status: VehicleStatus.ACTIVE,
    soldAt: undefined,
    createdAt: new Date("2023-10-02"),
    updatedAt: new Date("2025-07-22"),
    photoUrl: "/prata-sedan-estatico.png",
  }

  return { vehicle, events, documents, setEvents, setDocuments }
}