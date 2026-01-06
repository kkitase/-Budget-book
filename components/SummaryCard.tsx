import React, { useMemo } from 'react';
import { Expense } from '../types';
import { TrendingUp, TrendingDown, Calendar, Wallet, Minus } from 'lucide-react';

interface SummaryCardProps {
  expenses: Expense[];
  selectedDate: Date;
  previousMonthTotal?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ expenses, selectedDate, previousMonthTotal = 0 }) => {
  // Calculate total of the passed expenses (parent is responsible for filtering by month)
  const currentMonthTotal = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const monthName = selectedDate.toLocaleDateString('ja-JP', { month: 'long' });

  // Calculate Percentage Difference
  const percentageDiff = useMemo(() => {
    if (previousMonthTotal === 0) return null;
    return ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
  }, [currentMonthTotal, previousMonthTotal]);

  const renderComparison = () => {
    if (percentageDiff === null) {
      return (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-300 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Minus className="w-3 h-3" />
            <span>先月のデータがありません</span>
        </div>
      );
    }

    const isIncrease = percentageDiff > 0;
    const isZero = percentageDiff === 0;
    const absPercent = Math.abs(percentageDiff).toFixed(1);

    if (isZero) {
        return (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-300 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                <Minus className="w-3 h-3" />
                <span>先月と同じ支出額です</span>
            </div>
        );
    }

    if (isIncrease) {
        return (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-200 bg-red-500/20 w-fit px-3 py-1 rounded-full border border-red-500/20">
                <TrendingUp className="w-3 h-3" />
                <span>先月比 +{absPercent}%</span>
            </div>
        );
    }

    return (
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200 bg-emerald-500/20 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
            <TrendingDown className="w-3 h-3" />
            <span>先月比 -{absPercent}%</span>
        </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 text-white shadow-xl shadow-navy-900/20 relative overflow-hidden transition-all duration-300">
        {/* Decorative background circles */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>{monthName}の支出</span>
            </div>
            <div className="bg-white/10 p-1.5 rounded-lg">
                <Wallet className="w-4 h-4 text-primary-400" />
            </div>
        </div>
        
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-bold tracking-tight">
            ¥{currentMonthTotal.toLocaleString()}
          </span>
        </div>
        
        {renderComparison()}
      </div>
    </div>
  );
};

export default SummaryCard;