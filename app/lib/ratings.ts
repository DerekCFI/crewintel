/**
 * Calculate weighted detailed ratings for each category
 * Returns a score from 1-5 or null if insufficient data
 */

// Convert string ratings to numeric scale
const convertToScale = (value: string | null, mapping: Record<string, number>): number | null => {
  if (!value) return null;
  return mapping[value] ?? null;
};

// Noise level conversions
const noiseLevelMap: Record<string, number> = {
  'very-quiet': 5,
  'quiet': 4,
  'moderate': 3,
  'noisy': 2,
  'very-noisy': 1
};

// Staff responsiveness conversions
const responsivenessMap: Record<string, number> = {
  'excellent': 5,
  'good': 4,
  'fair': 3,
  'poor': 2,
  'very-poor': 1,
  'n/a': null as any
};

// Generic good/poor scale
const qualityMap: Record<string, number> = {
  'excellent': 5,
  'good': 4,
  'average': 3,
  'poor': 2,
  'very-poor': 1
};

// Frequency map
const frequencyMap: Record<string, number> = {
  'always': 5,
  'usually': 4,
  'sometimes': 3,
  'rarely': 2,
  'never': 1
};

interface WeightedField {
  value: number | null;
  weight: number;
}

const calculateWeightedAverage = (fields: WeightedField[]): number | null => {
  let totalWeight = 0;
  let weightedSum = 0;

  fields.forEach(({ value, weight }) => {
    if (value !== null && value > 0) {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

export function calculateHotelRating(review: any): number | null {
  const fields: WeightedField[] = [
    { value: review.bed_quality, weight: 2.0 },
    { value: review.room_cleanliness, weight: 2.0 },
    { value: convertToScale(review.noise_level, noiseLevelMap), weight: 1.5 },
    { value: review.wifi_quality, weight: 1.0 },
    { value: review.shower_quality, weight: 1.0 },
    { value: review.checkin_experience, weight: 1.0 },
    { value: convertToScale(review.staff_responsiveness, responsivenessMap), weight: 0.5 }
  ];

  return calculateWeightedAverage(fields);
}

export function calculateFBORating(review: any): number | null {
  const fields: WeightedField[] = [
    { value: review.service_speed, weight: 2.0 },
    { value: review.staff_attitude, weight: 2.0 },
    { value: review.crew_lounge_quality, weight: 1.5 },
    { value: review.fbo_amenities_quality, weight: 1.0 },
    { value: review.communication, weight: 1.0 },
    { value: review.bathroom_quality, weight: 0.5 },
    { value: review.fbo_wifi_quality, weight: 0.5 }
  ];

  return calculateWeightedAverage(fields);
}

export function calculateRestaurantRating(review: any): number | null {
  const fields: WeightedField[] = [
    { value: review.food_quality, weight: 2.5 },
    { value: review.restaurant_service_speed, weight: 1.5 },
    { value: convertToScale(review.atmosphere, qualityMap), weight: 1.0 }
  ];

  return calculateWeightedAverage(fields);
}

export function calculateRentalRating(review: any): number | null {
  const fields: WeightedField[] = [
    { value: review.rental_process_speed, weight: 2.0 },
    { value: review.vehicle_condition, weight: 2.0 },
    { value: review.staff_helpfulness, weight: 1.5 },
    { value: convertToScale(review.pricing_transparency, qualityMap), weight: 1.0 }
  ];

  return calculateWeightedAverage(fields);
}
