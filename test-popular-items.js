// Test script for popular items calculation
// This simulates the getPopularItems function from Analytics.jsx

const testOrders = [
  {
    id: '1',
    items: [
      { name: 'Pizza Margherita', quantity: 2 },
      { name: 'Caesar Salad', quantity: 1 },
      { name: 'Pizza Margherita', quantity: 1 }
    ]
  },
  {
    id: '2',
    items: [
      { name: 'Caesar Salad', quantity: 3 },
      { name: 'Pasta Carbonara', quantity: 1 }
    ]
  },
  {
    id: '3',
    items: [
      { name: 'Pizza Margherita', quantity: 1 },
      { name: 'Pasta Carbonara', quantity: 2 }
    ]
  }
];

function getPopularItems(orders) {
  console.log('Calculating popular items from orders:', orders.length);
  const itemCounts = {};
  
  orders.forEach((order, orderIndex) => {
    console.log(`Order ${orderIndex + 1} items:`, order.items);
    order.items?.forEach(item => {
      console.log(`Processing item: ${item.name}, quantity: ${item.quantity}`);
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  
  console.log('Item counts:', itemCounts);
  
  const popularItems = Object.entries(itemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  console.log('Popular items result:', popularItems);
  return popularItems;
}

// Test the function
console.log('🧪 Testing Popular Items Calculation\n');
const result = getPopularItems(testOrders);

console.log('\n📊 Expected Results:');
console.log('1. Pizza Margherita: 4 total (2+1+1)');
console.log('2. Caesar Salad: 4 total (1+3)');
console.log('3. Pasta Carbonara: 3 total (1+2)');

console.log('\n✅ Test completed! Check if the calculation matches expected results.');
