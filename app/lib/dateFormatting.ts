/**
 * Formats visit dates for display in reviews
 * - If both start and end dates exist and are different: "Jan 5-12, 2025"
 * - If only start date or both dates are the same: "Jan 5, 2025"
 * - If dates span different months: "Jan 5 - Feb 2, 2025"
 * - If dates span different years: "Dec 28, 2024 - Jan 3, 2025"
 */
export function formatVisitDateRange(
  visitDate: string | null | undefined,
  visitDateEnd: string | null | undefined
): string | null {
  if (!visitDate) {
    return null
  }

  const startDate = new Date(visitDate)

  // Check for invalid date
  if (isNaN(startDate.getTime())) {
    return null
  }

  // If no end date or end date is the same as start date
  if (!visitDateEnd || visitDate === visitDateEnd) {
    return startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const endDate = new Date(visitDateEnd)

  // Check for invalid end date
  if (isNaN(endDate.getTime())) {
    return startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()
  const startMonth = startDate.getMonth()
  const endMonth = endDate.getMonth()

  // Different years: "Dec 28, 2024 - Jan 3, 2025"
  if (startYear !== endYear) {
    const startFormatted = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const endFormatted = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    return `${startFormatted} - ${endFormatted}`
  }

  // Same year, different months: "Jan 5 - Feb 2, 2025"
  if (startMonth !== endMonth) {
    const startFormatted = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    const endFormatted = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    return `${startFormatted} - ${endFormatted}`
  }

  // Same month and year: "Jan 5-12, 2025"
  const monthName = startDate.toLocaleDateString('en-US', { month: 'short' })
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()

  return `${monthName} ${startDay}-${endDay}, ${startYear}`
}
