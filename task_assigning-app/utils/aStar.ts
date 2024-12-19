export interface Position {
    x: number;
    y: number;
  }
  
  export function aStar(
    grid: number[][],
    start: Position,
    goal: Position,
    isPositionBlocked: (pos: Position) => boolean
  ): Position[] {
    // Implement the A* algorithm here
    // For simplicity, we'll use Manhattan distance as the heuristic
    const openList: { pos: Position; g: number; h: number; f: number; parent: Position | null }[] = [];
    const closedList: Set<string> = new Set();
  
    const getKey = (pos: Position) => `${pos.x},${pos.y}`;
    const heuristic = (pos: Position) => Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
  
    openList.push({
      pos: start,
      g: 0,
      h: heuristic(start),
      f: heuristic(start),
      parent: null,
    });
  
    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;
  
      if (current.pos.x === goal.x && current.pos.y === goal.y) {
        const path: Position[] = [];
        let node: typeof current | null = current;
        while (node) {
          path.unshift(node.pos);
          node = openList.find((n) => getKey(n.pos) === getKey(node!.parent!)) || null;
        }
        return path;
      }
  
      closedList.add(getKey(current.pos));
  
      const neighbors = [
        { x: current.pos.x + 1, y: current.pos.y },
        { x: current.pos.x - 1, y: current.pos.y },
        { x: current.pos.x, y: current.pos.y + 1 },
        { x: current.pos.x, y: current.pos.y - 1 },
      ];
  
      neighbors.forEach((neighbor) => {
        if (
          neighbor.x < 0 ||
          neighbor.y < 0 ||
          neighbor.x >= grid[0].length ||
          neighbor.y >= grid.length ||
          closedList.has(getKey(neighbor)) ||
          isPositionBlocked(neighbor)
        ) {
          return;
        }
  
        const g = current.g + 1;
        const h = heuristic(neighbor);
        const f = g + h;
  
        const existing = openList.find((n) => getKey(n.pos) === getKey(neighbor));
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current.pos;
          }
        } else {
          openList.push({ pos: neighbor, g, h, f, parent: current.pos });
        }
      });
    }
  
    return [];
  }