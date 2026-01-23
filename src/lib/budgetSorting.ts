import type { BudgetItem } from '../stores/budgetStore';

const getMonthlyAmount = (item: BudgetItem): number => {
  if (item.frequency === 'yearly') return item.amount / 12;
  return item.amount;
};

/**
 * Sorts budget items to minimize crossings in Sankey diagrams and list views.
 * Strategy:
 * 1. Group items by Category.
 * 2. Sort Groups by Total Amount (Descending).
 * 3. Sort Items within Groups by Amount (Descending).
 */
export const sortBudgetData = (items: BudgetItem[]): BudgetItem[] => {
  // 1. Calculate total value for each category based on the items provided
  const categoryTotals = new Map<string, number>();

  items.forEach(item => {
    if (item.categoryId) {
      const current = categoryTotals.get(item.categoryId) || 0;
      categoryTotals.set(item.categoryId, current + getMonthlyAmount(item));
    }
  });

  // 2. Create a ranked list of categories (High Value -> Low Value)
  const sortedCategoryIds = Array.from(categoryTotals.keys()).sort((a, b) => {
    const totalA = categoryTotals.get(a) || 0;
    const totalB = categoryTotals.get(b) || 0;
    return totalB - totalA; // Descending
  });

  // Create a rank map for O(1) lookup
  const categoryRank = new Map<string, number>();
  sortedCategoryIds.forEach((id, index) => {
    categoryRank.set(id, index);
  });

  // 3. Sort items
  return [...items].sort((a, b) => {
    const rankA = a.categoryId && categoryRank.has(a.categoryId) ? categoryRank.get(a.categoryId)! : Number.MAX_SAFE_INTEGER;
    const rankB = b.categoryId && categoryRank.has(b.categoryId) ? categoryRank.get(b.categoryId)! : Number.MAX_SAFE_INTEGER;

    // Primary Sort: Category Rank
    if (rankA !== rankB) {
      return rankA - rankB; // Lower rank index means "higher" in the list (closer to top)
    }

    // Secondary Sort: Amount Descending
    return getMonthlyAmount(b) - getMonthlyAmount(a);
  });
};
