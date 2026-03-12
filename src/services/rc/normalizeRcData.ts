/**
 * Normalize RC API response to unified format.
 * Handles both "already verified" (rcData.data) and "newly verified" (rcData.result) formats.
 */

export interface UnifiedRcData {
  registrationNumber: string
  ownerName: string
  fatherName: string
  vehicleMakeModel: string
  manufacturer: string
  vehicleClass: string
  bodyType: string
  vehicleColor: string
  fuelType: string
  status: string
  registrationDate: string
  registrationLocation: string
  stateCode: string
  rtoCode: string
  vehicleAge: string
  chassisNumber: string
  engineNumber: string
  cubicCapacity: string
  cylinders: string
  grossWeight: string
  unladenWeight: string
  wheelbase: string
  seatingCapacity: string
  emissionNorms: string
  manufacturedDate: string
  fitnessValidUpto: string
  taxValidUpto: string
  expiryDate: string
  puccExpiryDate: string
  fitnessExpired: string
  insuranceCompany: string
  policyNumber: string
  insuranceExpiry: string
  remainingValidity: string
  insuranceExpired: string
  permitNumber: string
  permitType: string
  permitExpiryDate: string
  nationalPermitNumber: string
  nationalPermitIssuedBy: string
  nationalPermitExpiry: string
  vehicleFinanced: boolean
  financer: string
  presentAddress: string
  permanentAddress: string
  blacklistStatus: string
  nocDetails: string
  ownerSerialNumber: string
  state: string
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return String(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(dateStr ?? '')
  }
}

function calculateVehicleAge(manufacturedDate: string | null | undefined): string {
  if (!manufacturedDate) return ''
  try {
    const mfgDate = new Date(manufacturedDate)
    const now = new Date()
    const years = now.getFullYear() - mfgDate.getFullYear()
    const months = now.getMonth() - mfgDate.getMonth()
    if (months < 0) {
      return `${years - 1} years ${12 + months} months`
    }
    return `${years} years ${months} months`
  } catch {
    return ''
  }
}

export function normalizeRcData(
  rcData: Record<string, unknown> | null,
  rcNumber: string
): UnifiedRcData | null {
  if (!rcData) return null

  const d = rcData.data as Record<string, unknown> | undefined
  const r = rcData.result as Record<string, unknown> | undefined

  if (d) {
    return {
      registrationNumber: (d.vehicle_number as string) || rcNumber,
      ownerName: (d.owner as string) || '',
      fatherName: (d.owner_fathers_name as string) || '',
      vehicleMakeModel: (d.model_name as string) || '',
      manufacturer: (d.company_name as string) || '',
      vehicleClass: (d.class as string) || '',
      bodyType: (d.category as string) || '',
      vehicleColor: (d.color as string) || '',
      fuelType: (d.fuel_type as string) || '',
      status: (d.rc_status as string) || 'ACTIVE',
      registrationDate: formatDate(d.registration_date as string),
      registrationLocation: '',
      stateCode: ((d.vehicle_number as string) || '').substring(0, 2),
      rtoCode: (d.rto_code as string) || '',
      vehicleAge: calculateVehicleAge(d.manufacturing_date as string),
      chassisNumber: (d.chassis as string) || '',
      engineNumber: (d.engine as string) || '',
      cubicCapacity: d.cubic_capacity ? `${d.cubic_capacity} cc` : '',
      cylinders: d.no_cyl != null ? String(d.no_cyl) : '',
      grossWeight: d.gross_weight != null ? `${d.gross_weight} kg` : '',
      unladenWeight: d.unladen_weight != null ? `${d.unladen_weight} kg` : '',
      wheelbase: d.wheel_base != null ? `${d.wheel_base} mm` : '',
      seatingCapacity: d.seat_cap != null ? String(d.seat_cap) : '',
      emissionNorms: (d.norms_desc as string) || '',
      manufacturedDate: formatDate(d.manufacturing_date as string),
      fitnessValidUpto: formatDate(d.expiry_date as string),
      taxValidUpto: formatDate(d.tax_upto as string),
      expiryDate: formatDate(d.expiry_date as string),
      puccExpiryDate: '',
      fitnessExpired: '',
      insuranceCompany: (d.insurance_company as string) || '',
      policyNumber: (d.policy_number as string) || '',
      insuranceExpiry: formatDate(d.insurance_valid_till as string),
      remainingValidity: '',
      insuranceExpired: '',
      permitNumber: (d.permit_number as string) || '',
      permitType: '',
      permitExpiryDate: formatDate(d.permit_upto as string),
      nationalPermitNumber: '',
      nationalPermitIssuedBy: '',
      nationalPermitExpiry: '',
      vehicleFinanced: d.is_financed === 1,
      financer: (d.financier as string) || '',
      presentAddress: (d.present_address as string) || '',
      permanentAddress: (d.permanent_address as string) || '',
      blacklistStatus: (d.blacklist_status as string) || 'NA',
      nocDetails: (d.noc_details as string) || '',
      ownerSerialNumber: (d.owner_number as string) || '',
      state: '',
    }
  }

  if (r) {
    const ins = r.insurance as Record<string, unknown> | undefined
    return {
      registrationNumber: (r.registration_number as string) || rcNumber,
      ownerName: (r.user_name as string) || '',
      fatherName: (r.father_name as string) || '',
      vehicleMakeModel: (r.vehicle_make_model as string) || '',
      manufacturer: (r.vehicle_maker_description as string) || '',
      vehicleClass: (r.vehicle_class_description as string) || '',
      bodyType: (r.body_type_description as string) || '',
      vehicleColor: (r.vehicle_color as string) || '',
      fuelType: (r.vehicle_fuel_description as string) || '',
      status: (r.status as string) || 'ACTIVE',
      registrationDate: (r.registration_date as string) || '',
      registrationLocation: (r.registration_location as string) || '',
      stateCode: (r.state_code as string) || '',
      rtoCode: (r.rto_code as string) || '',
      vehicleAge: (r.vehicle_age as string) || '',
      chassisNumber: (r.chassis_number as string) || '',
      engineNumber: (r.engine_number as string) || '',
      cubicCapacity: r.vehicle_cubic_capacity != null ? `${r.vehicle_cubic_capacity} cc` : '',
      cylinders: (r.vehicle_number_of_cylinders as string) || '',
      grossWeight: r.vehicle_gross_weight != null ? `${r.vehicle_gross_weight} kg` : '',
      unladenWeight: r.vehicle_unladen_weight != null ? `${r.vehicle_unladen_weight} kg` : '',
      wheelbase: r.vehicle_wheelbase != null ? `${r.vehicle_wheelbase} mm` : '',
      seatingCapacity: (r.vehicle_seating_capacity as string) || '',
      emissionNorms: (r.norms_description as string) || '',
      manufacturedDate: (r.vehicle_manufactured_date as string) || '',
      fitnessValidUpto: (r.fit_upto as string) || '',
      taxValidUpto: (r.tax_upto as string) || '',
      expiryDate: (r.expiry_date as string) || '',
      puccExpiryDate: (r.pucc_expiry_date as string) || '',
      fitnessExpired: (r.vehicle_fitness_expired as string) || '',
      insuranceCompany: (ins?.company as string) || '',
      policyNumber: (ins?.policy_number as string) || '',
      insuranceExpiry: (ins?.expiry_date as string) || '',
      remainingValidity: (r.month_year_remaining_for_insurance_exp as string) || '',
      insuranceExpired: (r.insurance_expired as string) || '',
      permitNumber: (r.permit_number as string) || '',
      permitType: (r.permit_type as string) || '',
      permitExpiryDate: (r.permit_expiry_date as string) || '',
      nationalPermitNumber: (r.national_permit_number as string) || '',
      nationalPermitIssuedBy: (r.national_permit_issued_by as string) || '',
      nationalPermitExpiry: (r.national_permit_expiry_date as string) || '',
      vehicleFinanced: Boolean(r.vehicle_financed),
      financer: (r.financer as string) || '',
      presentAddress: (r.user_present_address as string) || '',
      permanentAddress: (r.user_permanent_address as string) || '',
      blacklistStatus: (r.blacklist_status as string) || 'NA',
      nocDetails: (r.noc_details as string) || '',
      ownerSerialNumber: (r.vehicle_owner_number as string) || '',
      state: (r.state as string) || '',
    }
  }

  return null
}
