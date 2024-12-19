import React from 'react';

interface OrderButtonsProps {
  onOrderSelect: (order: string) => void;
}

const OrderButtons: React.FC<OrderButtonsProps> = ({ onOrderSelect }) => {
  const orders = ['C0', 'C1', 'C2', 'C3'];

  return (
    <div className="flex gap-2">
      {orders.map((order) => (
        <button
          key={order}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => onOrderSelect(order)}
        >
          {order} Order
        </button>
      ))}
    </div>
  );
};

export default OrderButtons;



// import React from 'react';

// interface OrderButtonsProps {
//   onOrderSelect: (order: string) => void;
// }

// const OrderButtons: React.FC<OrderButtonsProps> = ({ onOrderSelect }) => {
//   const orders = ['C0', 'C1', 'C2', 'C3'];
//   return (
//     <div className="flex gap-4 mb-4">
//       {orders.map(order => (
//         <button
//           key={order}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           onClick={() => onOrderSelect(order)}
//         >
//           Order {order}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default OrderButtons;