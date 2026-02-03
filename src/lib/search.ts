import type { Workshop } from "./mockState";

const SYNONYMS: Record<string, string[]> = {
    "tyre": ["tire", "wheel", "rim", "alignment", "balancing"],
    "tire": ["tyre", "wheel", "rim", "alignment", "balancing"],
    "oil": ["lube", "lubricant", "service", "maintenance"],
    "maintenance": ["service", "oil", "checkup", "inspection"],
    "aircond": ["air", "conditioning", "cool", "gas", "ac", "a/c"],
    "ac": ["air", "conditioning", "cool", "gas", "aircond"],
    "paint": ["body", "scratch", "dent", "collision", "respray"],
    "body": ["paint", "scratch", "dent", "collision", "respray"],
    "battery": ["power", "start", "jump"],
    "brake": ["pad", "disc", "stop", "abs"],
    "engine": ["motor", "overhaul", "repair"],
    "shop": ["workshop", "center", "centre", "garage"],
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export interface SearchResult {
    workshop: Workshop;
    score: number;
    matches: string[];
}

export function searchWorkshops(query: string, workshops: Workshop[]): SearchResult[] {
    if (!query || query.trim() === "") {
        return workshops.map(w => ({ workshop: w, score: 1, matches: [] }));
    }

    const lowerQuery = query.toLowerCase().trim();
    const queryTokens = lowerQuery.split(/\s+/);

    // Expand query with synonyms
    const expandedTokens = new Set<string>(queryTokens);
    queryTokens.forEach(token => {
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach(syn => expandedTokens.add(syn));
        }
    });

    const results: SearchResult[] = workshops.map(workshop => {
        let score = 0;
        const matches: Set<string> = new Set();

        const nameTokens = (workshop.name || "").toLowerCase().split(/\s+/);
        const specialties = Array.isArray(workshop.specialties) ? workshop.specialties : [];
        const tagTokens = specialties.flatMap(t => (t || "").toLowerCase().split(/\s+/));
        const locationTokens = (workshop.location || "").toLowerCase().split(/\s+/);

        // Helper to check token match
        const checkMatch = (sourceToken: string, targetToken: string): number => {
            if (sourceToken === targetToken) return 1;
            if (sourceToken.includes(targetToken) || targetToken.includes(sourceToken)) return 0.8;

            const distance = levenshteinDistance(sourceToken, targetToken);
            const maxLength = Math.max(sourceToken.length, targetToken.length);

            // Allow 1 typo for short words, 2 for long words
            const allowedErrors = maxLength > 5 ? 2 : 1;
            if (distance <= allowedErrors) return 0.7;

            return 0;
        };

        expandedTokens.forEach(qToken => {
            // Check Name (Weight: 3)
            nameTokens.forEach(nToken => {
                const matchScore = checkMatch(nToken, qToken);
                if (matchScore > 0) {
                    score += matchScore * 3;
                    matches.add("name");
                }
            });

            // Check Tags (Weight: 2)
            tagTokens.forEach(tToken => {
                const matchScore = checkMatch(tToken, qToken);
                if (matchScore > 0) {
                    score += matchScore * 2;
                    matches.add("tag");
                }
            });

            // Check Location (Weight: 1)
            locationTokens.forEach(lToken => {
                const matchScore = checkMatch(lToken, qToken);
                if (matchScore > 0) {
                    score += matchScore * 1;
                    matches.add("location");
                }
            });
        });

        return {
            workshop,
            score,
            matches: Array.from(matches)
        };
    });

    // Filter out zero scores and sort by score descending
    return results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Return top 10
}

export interface WorkshopFilters {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
}

export function filterWorkshops(workshops: Workshop[], filters: WorkshopFilters): Workshop[] {
    return workshops.filter(workshop => {
        // 1. Category OR logic: if categories are specified, workshop must match at least one
        if (filters.categories && filters.categories.length > 0) {
            const hasCategoryMatch = filters.categories.some(cat =>
                (workshop.specialties || []).some(spec => spec.toLowerCase().includes(cat.toLowerCase()))
            );
            if (!hasCategoryMatch) return false;
        }

        // 2. Rating AND logic: must be >= specified rating
        if (filters.rating !== undefined && workshop.rating < filters.rating) {
            return false;
        }

        // 3. Price AND logic
        if (filters.minPrice !== undefined && workshop.price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice !== undefined && (filters.maxPrice < 1000 && workshop.price > filters.maxPrice)) {
            // Note: If maxPrice is 1000+, we treat it as "no upper limit" in current logic
            return false;
        }

        return true;
    });
}
