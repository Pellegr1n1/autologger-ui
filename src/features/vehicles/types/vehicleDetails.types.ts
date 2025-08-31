import React from "react"

export interface VehicleDetailsPageProps {
  vehicleId?: string
}

export interface StatItem {
  label: string
  value: string
  icon: React.ReactNode
}