import { Robot } from "../components/Simulation/types";
import { Position } from "./aStar";

export interface Task {
  id: string;
  type: string;
  position: Position;
  priority: number; // Higher value = higher priority
}

export function assignTasks(
  tasks: Task[],
  robots: Robot[],
  distanceCalculator: (start: Position, goal: Position) => number
): { [robotId: number]: Task | null } {
  const assignments: { [robotId: number]: Task | null } = {};
  
  // 配列をコピーして残りのタスクとロボットを保持
  const remainingTasks = [...tasks];
  const availableRobots: Robot[] = [...robots];  // ここで型を明示的に指定

  while (remainingTasks.length > 0 && availableRobots.length > 0) {
    let bestRobot: Robot | null = null;
    let bestTask: Task | null = null;
    let bestCost = Infinity;

    // ここをfor文に変更して、splice操作を適切に処理できるようにする
    for (let i = 0; i < availableRobots.length; i++) {
      const robot = availableRobots[i];

      for (let j = 0; j < remainingTasks.length; j++) {
        const task = remainingTasks[j];
        // タスクの優先度を考慮してコストを計算
        const cost = distanceCalculator(robot.position, task.position) - task.priority;

        if (cost < bestCost) {
          bestRobot = robot;
          bestTask = task;
          bestCost = cost;
        }
      }
    }

    // 最適なロボットとタスクが見つかった場合、そのロボットにタスクを割り当て
    if (bestRobot && bestTask) {
      assignments[bestRobot.id] = bestTask;
      availableRobots.splice(availableRobots.indexOf(bestRobot), 1); // ロボットをリストから削除
      remainingTasks.splice(remainingTasks.indexOf(bestTask), 1); // タスクをリストから削除
    }
  }

  // タスクのないロボットにはnullを割り当て
  availableRobots.forEach((robot) => {
    assignments[robot.id] = null;
  });

  return assignments;
}