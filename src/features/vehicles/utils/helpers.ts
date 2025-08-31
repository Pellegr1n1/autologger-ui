import { VehicleEventType, ChainStatus } from "../types/vehicle.types"

export function getVehicleEventTypeLabel(type: VehicleEventType): string {
    const labelMap: Record<VehicleEventType, string> = {
        [VehicleEventType.MAINTENANCE]: "Manutenção",
        [VehicleEventType.EXPENSE]: "Despesa",
        [VehicleEventType.FUEL]: "Abastecimento",
        [VehicleEventType.REPAIR]: "Reparo",
        [VehicleEventType.INSPECTION]: "Inspeção",
        [VehicleEventType.OTHER]: "Outros",
    }

    return labelMap[type] || "Desconhecido"
}

interface ChainStatusConfig {
    label: string
    color: string
    timelineColor: string
}

export function getChainStatusConfig(status: ChainStatus | undefined): ChainStatusConfig {
    const configMap: Record<string, ChainStatusConfig> = {
        'PENDING': {
            label: "Pendente",
            color: "orange",
            timelineColor: "orange",
        },
        'SUBMITTED': {
            label: "Submetido",
            color: "blue",
            timelineColor: "blue",
        },
        'CONFIRMED': {
            label: "Confirmado",
            color: "green",
            timelineColor: "green",
        },
        'FAILED': {
            label: "Falhou",
            color: "red",
            timelineColor: "red",
        },
        'REVERTED': {
            label: "Revertido",
            color: "default",
            timelineColor: "gray",
        },
    }

    if (!status || !status.status) {
        return {
            label: "Desconhecido",
            color: "default",
            timelineColor: "gray",
        }
    }
    
    return configMap[status.status] || {
        label: "Desconhecido",
        color: "default",
        timelineColor: "gray",
    }
}

export const VEHICLE_CATEGORIES = [
    { value: "Troca de óleo", label: "Troca de óleo" },
    { value: "Revisão", label: "Revisão" },
    { value: "Freios", label: "Freios" },
    { value: "Pneu", label: "Pneu" },
    { value: "Gasolina", label: "Gasolina" },
    { value: "Licenciamento", label: "Licenciamento" },
    { value: "Outros", label: "Outros" },
] as const

export const VEHICLE_EVENT_TYPES = [
    { value: "maintenance", label: "Manutenção" },
    { value: "expense", label: "Despesa" },
    { value: "fuel", label: "Abastecimento" },
    { value: "repair", label: "Reparo" },
    { value: "inspection", label: "Inspeção" },
    { value: "other", label: "Outros" },
] as const

export function isValidFileType(file: File): boolean {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ]
    return allowedTypes.includes(file.type)
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const CHART_COLORS = {
    primary: '#1677ff',
    secondary: '#13c2c2',
    accent: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    neutral: '#8c8c8c',
} as const

export const CHART_GRADIENTS = {
    blue: ['#1890ff', '#69c0ff'],
    green: ['#52c41a', '#95de64'],
    purple: ['#722ed1', '#b37feb'],
    orange: ['#fa8c16', '#ffc069'],
} as const

export const isValidVehicleEventType = (type: string): type is VehicleEventType => {
    return Object.values(VehicleEventType).includes(type as VehicleEventType)
}

export const isValidChainStatus = (status: string): boolean => {
    const validStatuses = ['PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED', 'REVERTED'];
    return validStatuses.includes(status);
}