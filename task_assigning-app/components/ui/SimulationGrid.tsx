import React from 'react';

interface Position {
  y: number;
  x: number;
}

interface Robot {
  id: number;
  position: Position;
}

interface MPS {
  type: string;
  position: Position;
}

interface SimulationGridProps {
  robots: Robot[];
  mpsStations: MPS[];
  fieldWidth: number;
  fieldHeight: number;
}

const SimulationGrid: React.FC<SimulationGridProps> = ({ robots, mpsStations, fieldWidth, fieldHeight }) => {
  return (
    <div className="grid gap-1 bg-gray-200 p-1 w-fit">
      {Array.from({ length: fieldHeight }).map((_, y) => (
        <div key={y} className="flex gap-1">
          {Array.from({ length: fieldWidth }).map((_, x) => {
            const mps = mpsStations.find(m => m.position.x === x && m.position.y === y);
            const robot = robots.find(r => r.position.x === x && r.position.y === y);
            
            return (
              <div key={`${y}-${x}`} className="w-12 h-12 bg-white flex items-center justify-center relative">
                {mps && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-200 rounded-full m-1">
                    <span className="text-sm font-bold">{mps.type}</span>
                  </div>
                )}
                {robot && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500 text-white rounded-full m-1 z-10">
                    <span className="text-sm font-bold">R{robot.id}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SimulationGrid;