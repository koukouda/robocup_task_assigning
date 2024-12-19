import React from 'react';

interface StatisticsProps {
  totalTime: number;
  completedTasks: number;
  robotUtilization: Map<number, number>;
  selectedOrders: string[];
}

const Statistics: React.FC<StatisticsProps> = ({ totalTime, completedTasks, robotUtilization, selectedOrders }) => {
  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <div className="flex-grow p-2 bg-gray-100 rounded">
          <strong>Simulation Time:</strong> {totalTime}s
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-grow p-2 bg-gray-100 rounded">
          <strong>Completed Tasks:</strong> {completedTasks}
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-grow p-2 bg-gray-100 rounded">
          <strong>Robot Utilization:</strong> {Array.from(robotUtilization.values()).join(', ')}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-grow p-2 bg-gray-100 rounded">
          <strong>Selected Orders:</strong> {selectedOrders.join(', ') || 'None'}
        </div>
      </div>
    </div>
  );
};

export default Statistics;









// import React from 'react';

// interface StatisticsProps {
//   totalTime: number;
//   completedTasks: number;
//   robotUtilization: Map<number, number>;
//   selectedOrders?: string[]; // Optional to prevent runtime errors
// }

// const Statistics: React.FC<StatisticsProps> = ({ totalTime, completedTasks, robotUtilization, selectedOrders = [] }) => {
//   return (
//     <div className="mt-4">
//       <div className="flex gap-2 mb-2">
//         <div className="flex-grow p-2 bg-gray-100 rounded">
//           <strong>Simulation Time:</strong> {totalTime}s
//         </div>
//       </div>
//       <div className="flex gap-2 mb-2">
//         <div className="flex-grow p-2 bg-gray-100 rounded">
//           <strong>Completed Tasks:</strong> {completedTasks}
//         </div>
//       </div>
//       <div className="flex gap-2 mb-2">
//         <div className="flex-grow p-2 bg-gray-100 rounded">
//           <strong>Robot Utilization:</strong> {Array.from(robotUtilization.values()).join(', ') || 'No data'}
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <div className="flex-grow p-2 bg-gray-100 rounded">
//           <strong>Selected Orders:</strong> {selectedOrders.join(', ') || 'No orders selected'}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Statistics;