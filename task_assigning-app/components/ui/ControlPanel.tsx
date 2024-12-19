import React from 'react';

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  onPlayPause,
  onReset,
  simulationSpeed,
  onSpeedChange
}) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={onPlayPause}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Reset
      </button>
      <div className="flex items-center">
        <label className="mr-2">Speed:</label>
        <input
          type="range"
          min="1"
          max="5"
          value={simulationSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="slider"
        />
        <span>{simulationSpeed}x</span>
      </div>
    </div>
  );
};

export default ControlPanel;