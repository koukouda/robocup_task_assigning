import { useState, useEffect } from 'react';

export const useSimulation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]); // 選択された注文を管理

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // シミュレーションが再生中の場合、定期的に更新
    if (isPlaying) {
      interval = setInterval(() => {
        console.log("Simulating at speed:", simulationSpeed);
        // シミュレーションの実行ロジック（タスクの処理やロボットの移動等）をここで呼び出す
      }, 1000 / simulationSpeed); // `simulationSpeed` に応じた更新間隔
    }

    // 停止時にインターバルをクリア
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, simulationSpeed]);

  // 注文選択のハンドラ
  const handleOrderSelect = (order: any) => {
    setSelectedOrders(prev => [...prev, order]);
  };

  // 再生/停止のトグル
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // シミュレーションのリセット
  const handleReset = () => {
    setIsPlaying(false);
    setSelectedOrders([]); // 注文のリセットなどを行う
  };

  // シミュレーション速度の変更
  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
  };

  return {
    isPlaying,
    simulationSpeed,
    selectedOrders,
    handleOrderSelect,
    handlePlayPause,
    handleReset,
    handleSpeedChange
  };
};