import { api } from './api'
import type { ActiveDriverPosition, DashboardStats } from '@/types/gpsTypes'

export class GpsTrackingApiService {
  private api = api

  async getActiveDriverPositions(): Promise<ActiveDriverPosition[]> {
    try {
      const response = await this.api.get('/gps-tracking/active-drivers')
      return response.data
    } catch (error) {
      console.error('Error fetching active drivers:', error)
      return []
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get('/gps-tracking/dashboard-stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { active_routes: 0, active_vehicles: 0, total_drivers: 0, tracking_drivers: 0 }
    }
  }

  async getDriverInfo(): Promise<any> {
    try {
      const response = await this.api.get('/gps-tracking/driver/me')
      return response.data
    } catch (error) {
      console.error('Error fetching driver info:', error)
      return null
    }
  }
}
