export interface UserProfile {
  uid: string
  firstName: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
  role?: string
  isActive?: boolean
  location?: {
    name: string
    link: string
  }
}