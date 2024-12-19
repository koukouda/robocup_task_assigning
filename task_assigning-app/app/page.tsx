"use client";

import React, { useState, useEffect } from "react";
import { Robot, Position, MPS, SimulationStep } from "../components/Simulation/types";
import ControlPanel from "@/components/ui/ControlPanel";
import OrderButtons from "@/components/ui/OrderButtons";
import SimulationGrid from "@/components/ui/SimulationGrid";
import Statistics from "@/components/ui/Statistics";

// Constants
const FIELD_WIDTH = 13;
const FIELD_HEIGHT = 8;
const INITIAL_ROBOT_POSITIONS: Position[] = [
  { y: 7, x: 10 },
  { y: 7, x: 11 },
  { y: 7, x: 12 },
];
const MPS_TYPES = ["CS", "RS", "BS", "DS"];
const SEQUENCES = {
  C0: ["CS", "RS", "BS", "CS", "DS"],
  C1: ["CS", "RS", "BS", "RS", "CS", "DS"],
  C2: ["RS", "BS", "CS", "DS"],
  C3: ["BS", "CS", "RS", "DS"],
};
const SPEED = 0.5; // m/s

export default function TaskAllocationOptimizer() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [mpsStations, setMpsStations] = useState<MPS[]>([]);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]); // 複数のオーダーを選択

  useEffect(() => {
    initializeSimulation();
  }, []);

  const initializeSimulation = () => {
    const initialRobots = INITIAL_ROBOT_POSITIONS.map((pos, i) => ({
      id: i + 1,
      position: pos,
      busy: false,
    }));
    setRobots(initialRobots);
    setMpsStations(generateMPSPositions());
    setSimulationSteps([]);
    setCurrentSequence([]);
    setIsPlaying(false);
    setSelectedOrders([]); // オーダーの初期化
  };

  const generateMPSPositions = (): MPS[] => {
    const positions: MPS[] = [];
    const usedPositions = new Set<string>();

    MPS_TYPES.forEach((type) => {
      let position: Position;
      do {
        position = {
          y: Math.floor(Math.random() * FIELD_HEIGHT),
          x: Math.floor(Math.random() * FIELD_WIDTH),
        };
      } while (usedPositions.has(`${position.y},${position.x}`));
      usedPositions.add(`${position.y},${position.x}`);
      positions.push({ type, position });
    });

    return positions;
  };

  const startTask = async () => {
    setIsPlaying(true);
    let taskCompleted = 0;

    // 複数のオーダーを処理
    while (taskCompleted < selectedOrders.length && isPlaying) {
      const step = selectedOrders[taskCompleted];
      const targetMPS = mpsStations.find((mps) => mps.type === step);
      if (!targetMPS) {
        taskCompleted++;
        continue;
      }

      // 協力してMPSを回るため、各ロボットの移動を制御
      await moveRobotsToMPS(targetMPS);

      taskCompleted++;
    }
    setIsPlaying(false);
  };

  const moveRobotsToMPS = async (targetMPS: MPS) => {
    // 各ロボットが協力してMPSに向かう
    const availableRobots = robots.filter((robot) => !robot.busy);

    // ロボットごとにMPSに向かう経路を計算して移動
    for (const robot of availableRobots) {
      const path = calculateAStarPath(robot.position, targetMPS.position);
      if (path.length > 0) {
        await moveAlongPath(robot, path);
      }
    }
  };

  const calculateAStarPath = (start: Position, goal: Position): Position[] => {
    const openList: { position: Position; f: number; g: number; h: number; parent: Position | null }[] = [];
    const closedList: Set<string> = new Set();
    const movements = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    ];

    const getHeuristic = (pos: Position): number => {
      return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y); // Manhattan距離
    };

    openList.push({ position: start, f: 0, g: 0, h: getHeuristic(start), parent: null });

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f); // f値でソート
      const currentNode = openList.shift()!;

      if (!currentNode) break;

      const { position, g, h, parent } = currentNode;

      if (position.x === goal.x && position.y === goal.y) {
        const path: Position[] = [];
        let current = parent;
        while (current) {
          path.unshift(current);
          const parentNode = openList.find((node) => node.position.x === current.x && node.position.y === current.y);
          if (!parentNode) break;
          current = parentNode.parent;
        }
        return path;
      }

      closedList.add(`${position.x},${position.y}`);

      movements.forEach((move) => {
        const newPosition: Position = { x: position.x + move.x, y: position.y + move.y };
        if (
          newPosition.x >= 0 && newPosition.x < FIELD_WIDTH &&
          newPosition.y >= 0 && newPosition.y < FIELD_HEIGHT &&
          !closedList.has(`${newPosition.x},${newPosition.y}`)
        ) {
          const gNew = g + 1;
          const hNew = getHeuristic(newPosition);
          const fNew = gNew + hNew;
          openList.push({ position: newPosition, f: fNew, g: gNew, h: hNew, parent: position });
        }
      });
    }

    return [];
  };

  const moveAlongPath = async (robot: Robot, path: Position[]) => {
    for (const step of path) {
      if (!isPlaying) break;

      // 進む先のマスに他のロボットがいないか確認
      if (robots.some((r) => r.position.x === step.x && r.position.y === step.y)) {
        // 他のロボットがいる場合、移動をスキップ
        continue;
      }

      // 1マスずつ進む
      setRobots((prevRobots) => prevRobots.map((r) =>
        r.id === robot.id ? { ...r, position: step, busy: true } : r
      ));

      await new Promise((resolve) => setTimeout(resolve, simulationSpeed / SPEED));

      // ロボットがMPSの隣に着いたら、その場で完了としてみなす
      if (
        Math.abs(step.x - robot.position.x) <= 1 &&
        Math.abs(step.y - robot.position.y) <= 1
      ) {
        setRobots((prevRobots) => prevRobots.map((r) =>
          r.id === robot.id ? { ...r, position: step, busy: false } : r
        ));
        break;
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Robot Task Allocation Simulator</h1>

      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={initializeSimulation}
        simulationSpeed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
      />

      <OrderButtons
        onOrderSelect={(key) => {
          const sequence = SEQUENCES[key as keyof typeof SEQUENCES];
          setSelectedOrders(sequence);  // 複数のオーダーを選択
        }}
      />

      <SimulationGrid robots={robots} mpsStations={mpsStations} fieldWidth={FIELD_WIDTH} fieldHeight={FIELD_HEIGHT} />

      <Statistics
        totalTime={simulationSteps.length}
        completedTasks={selectedOrders.length - simulationSteps.length}
        robotUtilization={new Map(
          robots.map((robot) => [robot.id, robot.busy ? 1 : 0])
        )}
        selectedOrders={selectedOrders}
      />
    </div>
  );
}






// "use client";

// import React, { useState, useEffect } from "react";
// import { Robot, Position, MPS, SimulationStep } from "../components/Simulation/types";
// import ControlPanel from "@/components/ui/ControlPanel";
// import OrderButtons from "@/components/ui/OrderButtons";
// import SimulationGrid from "@/components/ui/SimulationGrid";
// import Statistics from "@/components/ui/Statistics";

// // Constants
// const FIELD_WIDTH = 13;
// const FIELD_HEIGHT = 8;
// const INITIAL_ROBOT_POSITIONS: Position[] = [
//   { y: 7, x: 10 },
//   { y: 7, x: 11 },
//   { y: 7, x: 12 },
// ];
// const MPS_TYPES = ["CS", "RS", "BS", "DS"];
// const SEQUENCES = {
//   C0: ["CS", "RS", "BS", "CS", "DS"],
//   C1: ["CS", "RS", "BS", "RS", "CS", "DS"],
//   C2: ["RS", "BS", "CS", "DS"],
//   C3: ["BS", "CS", "RS", "DS"],
// };
// const SPEED = 0.5; // m/s

// export default function TaskAllocationOptimizer() {
//   const [robots, setRobots] = useState<Robot[]>([]);
//   const [mpsStations, setMpsStations] = useState<MPS[]>([]);
//   const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
//   const [currentSequence, setCurrentSequence] = useState<string[]>([]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [simulationSpeed, setSimulationSpeed] = useState(1000);

//   useEffect(() => {
//     initializeSimulation();
//   }, []);

//   const initializeSimulation = () => {
//     const initialRobots = INITIAL_ROBOT_POSITIONS.map((pos, i) => ({
//       id: i + 1,
//       position: pos,
//       busy: false,
//     }));
//     setRobots(initialRobots);
//     setMpsStations(generateMPSPositions());
//     setSimulationSteps([]);
//     setCurrentSequence([]);
//     setIsPlaying(false);
//   };

//   const generateMPSPositions = (): MPS[] => {
//     const positions: MPS[] = [];
//     const usedPositions = new Set<string>();

//     MPS_TYPES.forEach((type) => {
//       let position: Position;
//       do {
//         position = {
//           y: Math.floor(Math.random() * FIELD_HEIGHT),
//           x: Math.floor(Math.random() * FIELD_WIDTH),
//         };
//       } while (usedPositions.has(`${position.y},${position.x}`));
//       usedPositions.add(`${position.y},${position.x}`);
//       positions.push({ type, position });
//     });

//     return positions;
//   };

//   const startTask = async (sequence: string[]) => {
//     setIsPlaying(true);
//     for (const step of sequence) {
//       if (!isPlaying) break;
//       const targetMPS = mpsStations.find((mps) => mps.type === step);
//       if (!targetMPS) continue;

//       // Assign robots dynamically (could be improved with a more complex algorithm)
//       const availableRobot = robots.find((robot) => !robot.busy);
//       if (!availableRobot) continue;

//       const path = calculatePath(availableRobot.position, targetMPS.position);

//       for (const step of path) {
//         if (!isPlaying) break;
//         await new Promise((resolve) => setTimeout(resolve, simulationSpeed / SPEED));
//         setRobots((prev) => {
//           const updated = [...prev];
//           updated[robots.indexOf(availableRobot)] = { ...availableRobot, position: step, busy: true };
//           return updated;
//         });
//       }

//       // After task, mark robot as idle
//       setRobots((prev) => {
//         const updated = [...prev];
//         updated[robots.indexOf(availableRobot)] = { ...availableRobot, busy: false };
//         return updated;
//       });
//     }
//     setIsPlaying(false);
//   };

//   const calculatePath = (from: Position, to: Position): Position[] => {
//     const path: Position[] = [];
//     let current = { ...from };

//     while (current.x !== to.x || current.y !== to.y) {
//       if (current.x < to.x) current.x++;
//       else if (current.x > to.x) current.x--;

//       if (current.y < to.y) current.y++;
//       else if (current.y > to.y) current.y--;

//       path.push({ ...current });
//     }

//     return path;
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Robot Task Allocation Simulator</h1>

//       <ControlPanel
//         isPlaying={isPlaying}
//         onPlayPause={() => setIsPlaying(!isPlaying)}
//         onReset={initializeSimulation}
//         simulationSpeed={simulationSpeed}
//         onSpeedChange={setSimulationSpeed}
//       />

//       <OrderButtons
//         onOrderSelect={(key) => {
//           const sequence = SEQUENCES[key as keyof typeof SEQUENCES];
//           setCurrentSequence(sequence);
//           startTask(sequence);
//         }}
//       />

//       <SimulationGrid robots={robots} mpsStations={mpsStations} fieldWidth={FIELD_WIDTH} fieldHeight={FIELD_HEIGHT} />

//       <Statistics
//         totalTime={simulationSteps.length}
//         completedTasks={currentSequence.length - simulationSteps.length}
//         robotUtilization={new Map(
//           robots.map((robot) => [robot.id, robot.busy ? 1 : 0])
//         )}
//         selectedOrders={currentSequence}
//       />
//     </div>
//   );
// }







// "use client";

// import React, { useState } from 'react';
// import { useSimulation } from '../components/Simulation/useSimulation';
// import ControlPanel from '@/components/ui/ControlPanel';
// import OrderButtons from '@/components/ui/OrderButtons';
// import SimulationGrid from '@/components/ui/SimulationGrid';
// import Statistics from '@/components/ui/Statistics';

// export default function Page() {
//   const {
//     isPlaying,
//     simulationSpeed,
//     selectedOrders,
//     handleOrderSelect,
//     handlePlayPause,
//     handleReset,
//     handleSpeedChange
//   } = useSimulation();

//   // SimulationGrid用のデータを定義
//   const robots = [
//     { id: 1, name: 'Robot A', position: { x: 10, y: 2 } },
//     { id: 2, name: 'Robot B', position: { x: 3, y: 4 } }
//   ];

//   const mpsStations = [
//     { id: 1, type: 'Station A', position: { x: 5, y: 3 } },
//     { id: 2, type: 'Station B', position: { x: 8, y: 6 } }
//   ];

//   const fieldWidth = 13;  // 横のマス数
//   const fieldHeight = 8;  // 縦のマス数

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Robot Task Allocation Simulator</h1>
//       <ControlPanel
//         isPlaying={isPlaying}
//         onPlayPause={handlePlayPause}
//         onReset={handleReset}
//         simulationSpeed={simulationSpeed}
//         onSpeedChange={handleSpeedChange}
//       />
//       <OrderButtons onOrderSelect={handleOrderSelect} />
//       <SimulationGrid
//         robots={robots}
//         mpsStations={mpsStations}
//         fieldWidth={fieldWidth}
//         fieldHeight={fieldHeight}
//       />
//       <Statistics
//         totalTime={0}
//         completedTasks={0}
//         robotUtilization={new Map()}
//         selectedOrders={selectedOrders}
//       />
//     </div>
//   );
// }




// "use client";

// import React, { useState } from 'react';
// import { useSimulation } from '../components/Simulation/useSimulation';
// import ControlPanel from '@/components/ui/ControlPanel';
// import OrderButtons from '@/components/ui/OrderButtons';
// import SimulationGrid from '@/components/ui/SimulationGrid';
// import Statistics from '@/components/ui/Statistics';

// export default function Page() {
//   const { selectedOrders, handleOrderSelect } = useSimulation();
  
//   // ControlPanel用の状態を定義
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [simulationSpeed, setSimulationSpeed] = useState(1);

//   // ControlPanel用のハンドラを定義
//   const handlePlayPause = () => {
//     setIsPlaying(prev => !prev);
//   };

//   const handleReset = () => {
//     setIsPlaying(false);
//   };

//   const handleSpeedChange = (speed: number) => {
//     setSimulationSpeed(speed);
//   };

//   // SimulationGrid用のデータを定義
//   const robots = [
//     { id: 1, name: 'Robot A', position: { x: 10, y: 2 } },  // 位置を修正（13x8のグリッドに合わせて調整）
//     { id: 2, name: 'Robot B', position: { x: 3, y: 4 } }
//   ];

//   const mpsStations = [
//     { id: 1, type: 'Station A', position: { x: 5, y: 3 } }, // type と position を修正
//     { id: 2, type: 'Station B', position: { x: 8, y: 6 } }
//   ];

//   const fieldWidth = 13;  // 横のマス数
//   const fieldHeight = 8;  // 縦のマス数

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Robot Task Allocation Simulator</h1>
//       <ControlPanel
//         isPlaying={isPlaying}
//         onPlayPause={handlePlayPause}
//         onReset={handleReset}
//         simulationSpeed={simulationSpeed}
//         onSpeedChange={handleSpeedChange}
//       />
//       <OrderButtons onOrderSelect={handleOrderSelect} />
//       <SimulationGrid 
//         robots={robots} 
//         mpsStations={mpsStations} 
//         fieldWidth={fieldWidth} 
//         fieldHeight={fieldHeight} 
//       />
//       <Statistics
//         totalTime={0}
//         completedTasks={0}
//         robotUtilization={new Map()}
//         selectedOrders={selectedOrders}
//       />
//     </div>
//   );
// }



// "use client";

// import React, { useState, useEffect } from "react";
// import { Robot, Position, MPS, SimulationStep, Task } from "../components/Simulation/types";
// import ControlPanel from "@/components/ui/ControlPanel";
// import OrderButtons from "@/components/ui/OrderButtons";
// import SimulationGrid from "@/components/ui/SimulationGrid";
// import Statistics from "@/components/ui/Statistics";
// import { aStar } from "../utils/aStar"; // Import A* algorithm implementation
// import { assignTasks } from "../utils/taskAssignment"; // Import task assignment algorithm

// // Constants
// const FIELD_WIDTH = 13;
// const FIELD_HEIGHT = 8;
// const INITIAL_ROBOT_POSITIONS: Position[] = [
//   { y: 7, x: 10 },
//   { y: 7, x: 11 },
//   { y: 7, x: 12 },
// ];
// const MPS_TYPES = ["CS", "RS", "BS", "DS"];
// const SEQUENCES = {
//   C0: ["CS", "RS", "BS", "CS", "DS"],
//   C1: ["CS", "RS", "BS", "RS", "CS", "DS"],
//   C2: ["RS", "BS", "CS", "DS"],
//   C3: ["BS", "CS", "RS", "DS"],
// };

// export default function TaskAllocationOptimizer() {
//   const [robots, setRobots] = useState<Robot[]>([]);
//   const [mpsStations, setMpsStations] = useState<MPS[]>([]);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isPlaying, setIsPlaying] = useState(false);

//   useEffect(() => {
//     initializeSimulation();
//   }, []);

//   const initializeSimulation = () => {
//     const initialRobots = INITIAL_ROBOT_POSITIONS.map((pos, i) => ({
//       id: i + 1,
//       position: pos,
//       busy: false,
//       capabilities: { carryWeight: 10, speed: 1 },
//     }));

//     setRobots(initialRobots);
//     setMpsStations(generateMPSPositions());
//     setTasks([]);
//     setIsPlaying(false);
//   };

//   const generateMPSPositions = (): MPS[] => {
//     const positions: MPS[] = [];
//     const usedPositions = new Set<string>();

//     MPS_TYPES.forEach((type) => {
//       let position: Position;
//       do {
//         position = {
//           y: Math.floor(Math.random() * FIELD_HEIGHT),
//           x: Math.floor(Math.random() * FIELD_WIDTH),
//         };
//       } while (usedPositions.has(`${position.y},${position.x}`));
//       usedPositions.add(`${position.y},${position.x}`);
//       positions.push({ type, position });
//     });

//     return positions;
//   };

//   const startSimulation = () => {
//     const taskList = generateTasks(SEQUENCES.C0); // Example with sequence C0
//     const assignments = assignTasks(robots, taskList, mpsStations);
//     executeTasks(assignments);
//     setIsPlaying(true);
//   };

//   const generateTasks = (sequence: string[]): Task[] => {
//     return sequence.map((type, index) => ({
//       id: index + 1,
//       type,
//       priority: Math.floor(Math.random() * 10) + 1, // Random priority
//       position: mpsStations.find((mps) => mps.type === type)?.position || { x: 0, y: 0 },
//     }));
//   };

//   const executeTasks = (assignments: Map<Robot, Task[]>) => {
//     assignments.forEach((taskList, robot) => {
//       taskList.forEach(async (task) => {
//         const path = aStar(robot.position, task.position, FIELD_WIDTH, FIELD_HEIGHT, robots, mpsStations);
//         for (const step of path) {
//           await moveRobot(robot, step);
//         }
//         completeTask(robot, task);
//       });
//     });
//   };

//   const moveRobot = async (robot: Robot, nextPosition: Position) => {
//     return new Promise<void>((resolve) => {
//       setTimeout(() => {
//         setRobots((prev) => {
//           const updated = prev.map((r) =>
//             r.id === robot.id ? { ...r, position: nextPosition } : r
//           );
//           return updated;
//         });
//         resolve();
//       }, 1000 / robot.capabilities.speed);
//     });
//   };

//   const completeTask = (robot: Robot, task: Task) => {
//     setTasks((prev) => prev.filter((t) => t.id !== task.id));
//     setRobots((prev) =>
//       prev.map((r) => (r.id === robot.id ? { ...r, busy: false } : r))
//     );
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Robot Task Allocation Simulator</h1>

//       <ControlPanel
//         isPlaying={isPlaying}
//         onPlayPause={() => {
//           if (isPlaying) {
//             setIsPlaying(false);
//           } else {
//             startSimulation();
//           }
//         }}
//         onReset={initializeSimulation}
//       />

//       <OrderButtons
//         onOrderSelect={(key) => {
//           const sequence = SEQUENCES[key as keyof typeof SEQUENCES];
//           setTasks(generateTasks(sequence));
//         }}
//       />

//       <SimulationGrid
//         robots={robots}
//         mpsStations={mpsStations}
//         fieldWidth={FIELD_WIDTH}
//         fieldHeight={FIELD_HEIGHT}
//       />

//       <Statistics
//         tasksRemaining={tasks.length}
//         robotUtilization={robots.map((r) => ({ id: r.id, busy: r.busy }))}
//       />
//     </div>
//   );
// }
