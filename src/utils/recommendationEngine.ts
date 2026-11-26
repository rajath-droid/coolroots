import { FinderAnswers, Product, ProductVariant, RecommendationResult } from '../types';

function pickVariantForBudget(product: Product, budget: FinderAnswers['budget']): ProductVariant {
  const sorted = [...product.variants].sort((a, b) => a.price - b.price);

  if (budget === 'Under ₹500') {
    return sorted.find((v) => v.price <= 500) || sorted[0];
  }
  if (budget === '₹500–₹1,500') {
    const inRange = sorted.filter((v) => v.price >= 499 && v.price <= 1500);
    return inRange.length > 0 ? inRange[inRange.length - 1] : sorted[0];
  }
  if (budget === '₹1,500–₹3,000') {
    const inRange = sorted.filter((v) => v.price >= 1499 && v.price <= 3000);
    return inRange.length > 0 ? inRange[inRange.length - 1] : sorted[Math.min(1, sorted.length - 1)];
  }
  return sorted[sorted.length - 1];
}

export function generateCoolingRecommendations(
  products: Product[],
  answers: FinderAnswers
): RecommendationResult[] {
  const scored: RecommendationResult[] = products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    // Primary problem matching (highest signal)
    switch (answers.problem) {
      case 'Hot roof':
        if (product.id === 'lime-washed-roof-cooling-kit') {
          score += 55;
          reasons.push('Reflective slaked-lime coating directly reduces solar heat absorbed by exposed roof slabs.');
        } else if (product.id === 'traditional-courtyard-cooling-design') {
          score += 25;
          reasons.push('Architectural shading guidance helps protect upper-floor ceilings and terraces.');
        }
        break;

      case 'Direct sunlight':
        if (product.id === 'khus-grass-cooling-screens') {
          score += 50;
          reasons.push('Natural khus screens intercept direct sunlight on sun-facing windows while cooling passing breezes.');
        } else if (product.id === 'bamboo-and-chick-blinds') {
          score += 50;
          reasons.push('Split-bamboo blinds block 70–80% of direct solar glare before heat reaches window glass.');
        } else if (product.id === 'jalli-architecture-cooling-panels') {
          score += 32;
          reasons.push('Perforated jali screens filter harsh sun into soft dappled shade.');
        }
        break;

      case 'Need natural shade':
        if (product.id === 'bamboo-and-chick-blinds') {
          score += 52;
          reasons.push('Roll-up bamboo chick blinds provide adjustable natural shade for windows, balconies, and verandas.');
        } else if (product.id === 'khus-grass-cooling-screens') {
          score += 40;
          reasons.push('Woven vetiver screens offer dense daylight shade with optional misting.');
        } else if (product.id === 'jalli-architecture-cooling-panels') {
          score += 38;
          reasons.push('Architectural jali screens create permanent structured shade and privacy.');
        }
        break;

      case 'Poor airflow':
        if (product.id === 'jalli-architecture-cooling-panels') {
          score += 52;
          reasons.push('Perforated lattice apertures encourage steady cross-ventilation without sacrificing privacy.');
        } else if (product.id === 'traditional-courtyard-cooling-design') {
          score += 48;
          reasons.push('Courtyard and layout consultation identifies practical cross-breeze and stack-ventilation paths.');
        } else if (product.id === 'terracotta-cooling-tower') {
          score += 30;
          reasons.push('Selected models include optional low-wattage fan-assisted airflow for stagnant semi-open corners.');
        }
        break;

      case 'Hot outdoor waiting area':
        if (product.id === 'terracotta-cooling-tower') {
          score += 55;
          reasons.push('Porous terracotta evaporative towers are built specifically for semi-outdoor patios and waiting areas.');
        } else if (product.id === 'bamboo-and-chick-blinds') {
          score += 36;
          reasons.push('Exterior bamboo blinds shield outdoor waiting benches from direct afternoon sun.');
        } else if (product.id === 'khus-grass-cooling-screens') {
          score += 32;
          reasons.push('Dampened khus screens cool warm outdoor air flowing into shaded waiting zones.');
        }
        break;

      case 'Need cooler water':
        if (product.id === 'matka-cooling-system') {
          score += 65;
          reasons.push('Porous terracotta matkas cool drinking water naturally via evaporation with zero electricity.');
        }
        break;
    }

    // Space matching
    if (answers.space === 'Rooftop' && product.id === 'lime-washed-roof-cooling-kit') {
      score += 30;
      reasons.push('Sized for flat RCC, mosaic, or tiled rooftops.');
    }
    if ((answers.space === 'Bedroom' || answers.space === 'Living room') &&
      (product.id === 'khus-grass-cooling-screens' || product.id === 'bamboo-and-chick-blinds')) {
      score += 22;
    }
    if (answers.space === 'Balcony' &&
      (product.id === 'bamboo-and-chick-blinds' || product.id === 'jalli-architecture-cooling-panels' || product.id === 'khus-grass-cooling-screens')) {
      score += 24;
    }
    if (answers.space === 'Courtyard' &&
      (product.id === 'traditional-courtyard-cooling-design' || product.id === 'terracotta-cooling-tower' || product.id === 'jalli-architecture-cooling-panels')) {
      score += 28;
    }
    if (answers.space === 'Outdoor waiting area' &&
      (product.id === 'terracotta-cooling-tower' || product.id === 'bamboo-and-chick-blinds')) {
      score += 28;
    }
    if ((answers.space === 'Shop' || answers.space === 'Office') &&
      (product.id === 'matka-cooling-system' || product.id === 'khus-grass-cooling-screens' || product.id === 'terracotta-cooling-tower')) {
      score += 18;
    }

    // Preference matching
    if (answers.preference === 'Traditional natural materials' &&
      ['terracotta-cooling-tower', 'khus-grass-cooling-screens', 'matka-cooling-system', 'bamboo-and-chick-blinds'].includes(product.id)) {
      score += 16;
    }
    if (answers.preference === 'Low electricity usage' &&
      ['matka-cooling-system', 'bamboo-and-chick-blinds', 'lime-washed-roof-cooling-kit', 'khus-grass-cooling-screens'].includes(product.id)) {
      score += 16;
    }
    if (answers.preference === 'Home architecture solution' &&
      ['jalli-architecture-cooling-panels', 'traditional-courtyard-cooling-design', 'lime-washed-roof-cooling-kit'].includes(product.id)) {
      score += 20;
    }
    if (answers.preference === 'Outdoor cooling' &&
      ['terracotta-cooling-tower', 'bamboo-and-chick-blinds', 'khus-grass-cooling-screens'].includes(product.id)) {
      score += 18;
    }

    const recommendedVariant = pickVariantForBudget(product, answers.budget);

    // Budget alignment bonus or gentle penalty
    const price = recommendedVariant.price;
    if (answers.budget === 'Under ₹500' && price <= 500) score += 20;
    else if (answers.budget === '₹500–₹1,500' && price >= 499 && price <= 1500) score += 18;
    else if (answers.budget === '₹1,500–₹3,000' && price >= 1499 && price <= 3000) score += 18;
    else if (answers.budget === '₹3,000+' && price >= 1999) score += 15;
    else if (answers.budget === 'Under ₹500' && price > 1000) score -= 18;

    if (answers.preference === 'Affordable solution' && price <= 1000) {
      score += 16;
    }

    const fallbackReason =
      reasons[0] ||
      `Supports passive comfort for your ${answers.space.toLowerCase()} with ${product.specifications.material.toLowerCase()}.`;

    return {
      product,
      recommendedVariant,
      reason: reasons.slice(0, 2).join(' ') || fallbackReason,
      matchScore: score,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
