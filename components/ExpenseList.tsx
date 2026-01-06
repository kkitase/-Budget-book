import React from 'react';
import { Expense } from '../types';
import { ShoppingBag, CalendarDays, Trash2 } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  // Group expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-500">この月の記録はありません</p>
        <p className="text-sm mt-1">レシートを追加して記録しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">履歴</h2>
      {sortedExpenses.map((expense) => (
        <div 
          key={expense.id} 
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-transform duration-100"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl text-primary-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{expense.storeName}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <CalendarDays className="w-3 h-3" />
                <span>{expense.date}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <span className="font-bold text-lg text-navy-900">
              ¥{expense.amount.toLocaleString()}
            </span>
             <button 
                onClick={() => onDelete(expense.id)}
                className="text-gray-300 hover:text-red-500 p-2 -mr-2"
                aria-label="Delete"
             >
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;