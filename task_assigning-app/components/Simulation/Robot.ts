import { Robot, Position } from './types';

export function findBestRobot(
  robots: Robot[],
  availability: Map<number, number>,
  currentTime: number,
  targetPosition: Position,
  calculateMovementTime: (from: Position, to: Position) => number
): { robotId: number; availableAt: number } {
  let bestRobot = { robotId: 0, availableAt: Infinity };

  robots.forEach((robot) => {
    const robotAvailableAt = Math.max(availability.get(robot.id) || 0, currentTime);
    const timeToTarget = calculateMovementTime(robot.position, targetPosition);
    const totalTime = robotAvailableAt + timeToTarget;

    if (totalTime < bestRobot.availableAt) {
      bestRobot = { robotId: robot.id, availableAt: totalTime };
    }
  });

  return bestRobot;
}