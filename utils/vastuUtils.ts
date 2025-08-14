
// src/utils/vastuUtils.ts
import type { Room, PlanNorthDirection } from '../types/index'; 

export interface RoomDataForVastu {
  type: string;
  orientation?: string; 
  planNorthDirection: PlanNorthDirection;
}

export interface VastuComplianceReport {
  score: number;
  summary: string;
  recommendations: string[];
  warnings: string[];
}

/**
 * Provides a quick Vastu indicator summary for a given Room.
 * This is a simplified logic for demonstration.
 */
export const getVastuQuickIndicator = (room: Pick<Room, 'type' | 'orientation'>, planNorthDirection: PlanNorthDirection): { summary: string; scoreConcept: number; colorHint: string } => {
  if (!room.type || !room.orientation) {
    return {
      summary: "Room type or orientation not defined for Vastu scan.",
      scoreConcept: 0,
      colorHint: 'gray',
    };
  }

  const roomType = room.type.toLowerCase();
  const roomOrientation = room.orientation.toLowerCase();
  let score = 50; // Neutral default
  let summary = `Vastu for a ${room.type} in the ${room.orientation} is generally neutral.`;
  let colorHint = 'text-yellow-400';

  if (roomType.includes("kitchen")) {
    if (roomOrientation.includes("south-east")) {
      score = 90;
      summary = "Excellent: Kitchen in the South-East (Agni) zone is ideal.";
      colorHint = 'text-emerald-400';
    } else if (roomOrientation.includes("north-west")) {
      score = 75;
      summary = "Good: Kitchen in the North-West zone is a viable alternative.";
      colorHint = 'text-emerald-400';
    } else if (roomOrientation.includes("north-east")) {
      score = 10;
      summary = "Poor: Kitchen in the North-East (Ishan) zone is a major Vastu defect.";
      colorHint = 'text-red-400';
    } else {
      score = 40;
      summary = `Okay: Kitchen placement in the ${room.orientation} may need remedies.`;
      colorHint = 'text-yellow-400';
    }
  }

  return {
    summary: `${summary} (Score: ${score}/100)`,
    scoreConcept: score,
    colorHint: colorHint,
  };
};