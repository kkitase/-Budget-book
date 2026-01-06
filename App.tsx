import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense, LoadingState, ReceiptData } from './types';
import { geminiService } from './services/geminiService';
import SummaryCard from './components/SummaryCard';
import ExpenseList from './components/ExpenseList';
import LoadingOverlay from './components/LoadingOverlay';
import EditModal from './components/EditModal';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for the currently viewed month
  const [currentDate, setCurrentDate] = useState(new Date());

  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Filter expenses for the selected month
  const monthlyExpenses = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  }, [expenses, currentDate]);

  // Calculate previous month's total for comparison
  const previousMonthTotal = useMemo(() => {
    // Get date object for previous month
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === prevYear && expenseDate.getMonth() === prevMonth;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    event.target.value = '';

    setLoadingState('analyzing');
    try {
      const data = await geminiService.processReceiptImage(file);
      setScannedData(data);
      setLoadingState('idle');
      setIsModalOpen(true);
    } catch (error: any) {
      console.error(error);
      alert("読み取りに失敗しました。もう一度試すか、手動で入力してください。");
      setLoadingState('idle');
      // Fallback to manual entry with empty data
      setScannedData({
        storeName: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0
      });
      setIsModalOpen(true);
    }
  };

  const handleSaveExpense = (data: ReceiptData) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now()
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    setIsModalOpen(false);
    setScannedData(null);
    
    // If the saved expense is not in the current view, switch to that month?
    // For now, let's keep the user where they are, but maybe they want to see the new item.
    // Optional: Switch view to the date of the new expense
    const expenseDate = new Date(data.date);
    if (expenseDate.getMonth() !== currentDate.getMonth() || expenseDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1));
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('この記録を削除してもよろしいですか？')) {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <LoadingOverlay isVisible={loadingState === 'analyzing'} />
      
      <EditModal 
        isOpen={isModalOpen}
        initialData={scannedData}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
      />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-primary-500 p-1.5 rounded-lg text-white">
                <Receipt className="w-4 h-4" />
             </div>
             <h1 className="text-lg font-bold text-navy-900 tracking-tight">スナップ家計簿</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm border border-gray-100">
            <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-navy-900 text-lg">
                {formatMonth(currentDate)}
            </h2>
            <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>

        <SummaryCard 
          expenses={monthlyExpenses} 
          selectedDate={currentDate}
          previousMonthTotal={previousMonthTotal}
        />
        
        <ExpenseList expenses={monthlyExpenses} onDelete={handleDeleteExpense} />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <button
          onClick={triggerCamera}
          className="pointer-events-auto bg-navy-900 hover:bg-navy-800 text-white rounded-full p-4 shadow-xl shadow-navy-900/40 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 group"
          aria-label="Add Receipt"
        >
          <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="font-bold pr-2">レシート撮影</span>
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment" // Prefer rear camera on mobile
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {/* Bottom spacer for FAB */}
      <div className="h-20"></div>
    </div>
  );
};

export default App;