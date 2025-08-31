import { getVehicleEventTypeLabel } from "./helpers"
import type { VehicleEvent } from "../types/vehicle.types"

export interface VehicleStats {
  totalEvents: number
  totalCost: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  costByType: Record<string, number>
  costByCategory: Record<string, number>
  averageCost: number
  lastEventDate?: Date
  nextServiceEstimate?: number
}

export function calculateVehicleStats(events: VehicleEvent[]): VehicleStats {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      totalCost: 0,
      eventsByType: {},
      eventsByCategory: {},
      costByType: {},
      costByCategory: {},
      averageCost: 0,
    }
  }

  const stats: VehicleStats = {
    totalEvents: events.length,
    totalCost: 0,
    eventsByType: {},
    eventsByCategory: {},
    costByType: {},
    costByCategory: {},
    averageCost: 0,
    lastEventDate: undefined,
    nextServiceEstimate: undefined,
  }

  events.forEach((e) => {
    const key = e.category || getVehicleEventTypeLabel(e.type)
    
    // Contar eventos por tipo
    stats.eventsByType[e.type] = (stats.eventsByType[e.type] || 0) + 1
    
    // Contar eventos por categoria
    stats.eventsByCategory[key] = (stats.eventsByCategory[key] || 0) + 1
    
    // Somar custos por tipo
    stats.costByType[e.type] = (stats.costByType[e.type] || 0) + e.cost
    
    // Somar custos por categoria
    stats.costByCategory[key] = (stats.costByCategory[key] || 0) + e.cost
    
    // Total geral
    stats.totalCost += e.cost
    
    // Última data de evento
    if (!stats.lastEventDate || new Date(e.date) > stats.lastEventDate) {
      stats.lastEventDate = new Date(e.date)
    }
  })

  // Calcular custo médio
  stats.averageCost = stats.totalCost / stats.totalEvents

  return stats
}