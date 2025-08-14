
// src/lib/colorUtils.ts

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Light Green
  '#F7D1BA', // Light Orange
  '#E17F93', // Pink
  '#BEAEE2', // Lavender
];

/**
 * Generates a consistent color from a predefined list based on a user's ID.
 * This ensures each user has a visually distinct color for their cursor/selections.
 * @param userId The unique identifier of the user.
 * @returns A hex color string.
 */
export const getColorForUserId = (userId: string): string => {
  // Simple hash function to get a number from the string
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};
