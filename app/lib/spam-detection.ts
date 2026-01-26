/**
 * Spam Detection System
 *
 * Uses a multi-layered approach:
 * 1. Heuristic rules (fast, free)
 * 2. Pattern matching for known spam
 * 3. Quality scoring
 *
 * Returns a spam score from 0-100 where:
 * - 0-30: Likely legitimate
 * - 31-60: Suspicious, needs review
 * - 61-100: Likely spam, auto-flag
 */

interface SpamCheckResult {
  score: number
  reasons: string[]
  autoFlag: boolean
}

// Common spam patterns
const SPAM_PATTERNS = [
  /\b(buy|sell|discount|offer|deal|free|click here|act now)\b/gi,
  /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/gi,
  /\b(earn money|make money|work from home|mlm|cryptocurrency)\b/gi,
  /\$\d+[,\d]*\s*(per|a)\s*(day|week|month|hour)/gi,
  /(http|https|www\.)[^\s]+/gi, // URLs in reviews are suspicious
  /(.)\1{4,}/g, // Repeated characters (aaaaa, !!!!!!)
]

// Suspicious email patterns
const SUSPICIOUS_EMAIL_PATTERNS = [
  /@(temp|fake|spam|trash|guerrilla)/i,
  /\d{5,}@/i, // Lots of numbers in email
]

export function checkForSpam(review: {
  reviewText: string
  userEmail?: string | null
  locationName: string
  overallRating: number
}): SpamCheckResult {
  const reasons: string[] = []
  let score = 0

  const text = review.reviewText

  // 1. Check text length and quality
  if (text.length < 60) {
    score += 15
    reasons.push('Very short review')
  }

  // 2. Check for ALL CAPS
  const capsRatio = (text.match(/[A-Z]/g)?.length || 0) / text.length
  if (capsRatio > 0.5 && text.length > 20) {
    score += 25
    reasons.push('Excessive caps')
  }

  // 3. Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) {
      score += 15 * matches.length
      reasons.push(`Spam pattern: "${matches[0]}"`)
    }
  }

  // 4. Check for URLs (unusual in genuine reviews)
  const urlMatches = text.match(/(http|https|www\.)[^\s]+/gi)
  if (urlMatches) {
    score += 30
    reasons.push('Contains URLs')
  }

  // 5. Check for excessive punctuation
  const punctuationRatio = (text.match(/[!?]{2,}/g)?.length || 0)
  if (punctuationRatio > 2) {
    score += 10
    reasons.push('Excessive punctuation')
  }

  // 6. Check for suspicious email patterns
  if (review.userEmail) {
    for (const pattern of SUSPICIOUS_EMAIL_PATTERNS) {
      if (pattern.test(review.userEmail)) {
        score += 20
        reasons.push('Suspicious email address')
        break
      }
    }
  }

  // 7. Check for generic/template-like content
  const genericPhrases = [
    'great place',
    'highly recommend',
    'best ever',
    'worst ever',
    'terrible',
    'amazing',
  ]
  const lowerText = text.toLowerCase()
  let genericCount = 0
  for (const phrase of genericPhrases) {
    if (lowerText.includes(phrase)) genericCount++
  }
  if (genericCount >= 3 && text.length < 100) {
    score += 15
    reasons.push('Generic template-like content')
  }

  // 8. Check for keyboard spam patterns
  if (/asdf|qwer|zxcv|1234|aaaa|test/i.test(text)) {
    score += 40
    reasons.push('Keyboard spam pattern')
  }

  // 9. Extreme ratings with minimal content
  if ((review.overallRating === 1 || review.overallRating === 5) && text.length < 80) {
    score += 10
    reasons.push('Extreme rating with minimal detail')
  }

  // 10. Check if review matches location name suspiciously
  if (text.toLowerCase().includes(review.locationName.toLowerCase()) && text.length < 100) {
    // Could be copy-pasted or low effort
    score += 5
  }

  // Cap the score at 100
  score = Math.min(score, 100)

  return {
    score,
    reasons,
    autoFlag: score >= 60
  }
}

/**
 * Analyze review and return moderation recommendation
 */
export function getSpamVerdict(result: SpamCheckResult): 'approve' | 'review' | 'flag' {
  if (result.score >= 60) return 'flag'
  if (result.score >= 30) return 'review'
  return 'approve'
}
