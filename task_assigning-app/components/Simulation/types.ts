export interface Position {
    y: number;
    x: number;
  }
  
  export interface Robot {
    id: number;
    position: Position;
    busy: boolean;
    currentTask?: string;
  }
  
  export interface MPS {
    type: string;
    position: Position;
  }
  
  export interface Task {
    id: string;
    sequence: string[];
    priority: number;
    startTime?: number;
    endTime?: number;
  }
  
  export interface SimulationStep {
    robotId: number;
    taskId: string;
    mpsType: string;
    timeToComplete: number;
  }