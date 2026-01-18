
import { performance } from 'perf_hooks';

// Mock types
interface Scenario {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  results?: {
    affordabilityCheck: {
      isAffordable: boolean;
      utilizationPercent: number;
    }
  };
  params: {
    purchase: {
      purchasePrice: number;
    }
  };
  updatedAt: string;
}

// Generate large dataset
const generateScenarios = (count: number): Scenario[] => {
  const scenarios: Scenario[] = [];
  for (let i = 0; i < count; i++) {
    scenarios.push({
      id: `id-${i}`,
      name: `Scenario Number ${i} with some detailed name`,
      description: `Description for scenario ${i} which might contain some keywords like affordable or luxury`,
      isFavorite: i % 10 === 0,
      results: {
        affordabilityCheck: {
          isAffordable: i % 2 === 0,
          utilizationPercent: Math.random() * 100
        }
      },
      params: {
        purchase: {
          purchasePrice: 500000 + i * 1000
        }
      },
      updatedAt: new Date().toISOString()
    });
  }
  return scenarios;
};

const scenarios = generateScenarios(10000);
const searchQuery = "luxury";
const filter = 'all';

// Current implementation logic
const runCurrentImplementation = (iterations: number) => {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const lowerSearchQuery = searchQuery.toLowerCase();

    const filtered = scenarios.filter(scenario => {
      let matchesSearch = true;
      if (lowerSearchQuery) {
        matchesSearch = scenario.name.toLowerCase().includes(lowerSearchQuery) ||
          (scenario.description?.toLowerCase().includes(lowerSearchQuery) ?? false);
      }

      if (!matchesSearch) return false;

      if (filter === 'favorites' && !scenario.isFavorite) return false;
      // ... other filters skipped for brevity as search is the focus
      return true;
    });
  }

  const end = performance.now();
  return end - start;
};

// Optimized implementation logic
// Pre-compute searchable text
const prepareOptimizedData = () => {
  return scenarios.map(s => ({
    ...s,
    lowerName: s.name.toLowerCase(),
    lowerDesc: s.description?.toLowerCase()
  }));
};

const runOptimizedImplementation = (iterations: number, preparedData: any[]) => {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const lowerSearchQuery = searchQuery.toLowerCase();

    const filtered = preparedData.filter(scenario => {
      let matchesSearch = true;
      if (lowerSearchQuery) {
        matchesSearch = scenario.lowerName.includes(lowerSearchQuery) ||
          (scenario.lowerDesc?.includes(lowerSearchQuery) ?? false);
      }

      if (!matchesSearch) return false;

      if (filter === 'favorites' && !scenario.isFavorite) return false;
      return true;
    });
  }

  const end = performance.now();
  return end - start;
};

// Run benchmarks
const ITERATIONS = 1000;

console.log(`Running benchmark with ${scenarios.length} scenarios and ${ITERATIONS} iterations...`);

// Warmup
runCurrentImplementation(10);

const currentDuration = runCurrentImplementation(ITERATIONS);
console.log(`Current Implementation: ${currentDuration.toFixed(2)}ms`);

// Warmup optimized
const preparedData = prepareOptimizedData();
runOptimizedImplementation(10, preparedData);

const optimizedDuration = runOptimizedImplementation(ITERATIONS, preparedData);
console.log(`Optimized Implementation: ${optimizedDuration.toFixed(2)}ms`);

const improvement = ((currentDuration - optimizedDuration) / currentDuration) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
