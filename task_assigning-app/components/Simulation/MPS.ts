import { Task } from './types';

export function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `Task-${i + 1}`,
    sequence: generateTaskSequence(),
    priority: Math.floor(Math.random() * 4) + 1,
  }));
}

function generateTaskSequence(): string[] {
  const sequences = {
    C0: ['CS', 'RS', 'BS', 'CS', 'DS'],
    C1: ['CS', 'RS', 'BS', 'RS', 'CS', 'DS'],
    C2: ['RS', 'BS', 'CS', 'DS'],
    C3: ['BS', 'CS', 'RS', 'DS'],
  };
  const types = ['C0', 'C1', 'C2', 'C3'];
  return sequences[types[Math.floor(Math.random() * types.length)] as keyof typeof sequences];
}