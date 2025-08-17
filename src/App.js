import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, Sun, Moon, PieChart, List } from 'lucide-react';

// --- Mock Data ---
const initialTransactions = [
  { id: 1, text: '점심 식사 (동료들과)', amount: -35000, category: '식비', date: '2024-07-22', memo: '3명 중 내가 먼저 결제' },
  { id: 2, text: '7월 급여', amount: 3000000, category: '급여', date: '2024-07-21', memo: '' },
  { id: 3, text: '온라인 쇼핑', amount: -78000, category: '쇼핑', date: '2024-07-20', memo: '여름 옷 구매' },
  { id: 4, text: '주말 장보기', amount: -125000, category: '식비', date: '2024-07-19', memo: '' },
  { id: 5, text: 'OTT 구독료', amount: -17000, category: '구독', date: '2024-07-18', memo: '월 정기 결제' },
  { id: 6, text: '친구 축의금', amount: -100000, category: '경조사', date: '2024-07-17', memo: '' },
  { id: 7, text: '교통카드 충전', amount: -50000, category: '교통', date: '2024-07-16', memo: '' },
];

// --- 소비 분석 페이지 컴포넌트 ---
const AnalysisPage = ({ transactions, summary, themeClasses, formatCurrency }) => {
    const categorySpending = useMemo(() => {
        const spending = {};
        transactions.forEach(t => { if (t.amount < 0) spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount); });
        return Object.entries(spending).sort((a, b) => b[1] - a[1]);
    }, [transactions]);

    const totalExpense = Math.abs(summary.expense);
    const categoryHexColors = ['#4f46e5', '#06b6d4', '#14b8a6', '#f97316', '#ec4899', '#a855f7', '#eab308'];
    const categoryTailwindColors = ['bg-indigo-600', 'bg-cyan-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500', 'bg-yellow-500'];

    const conicGradientStops = useMemo(() => {
        if (totalExpense === 0) return 'transparent 0% 100%';
        let cumulativePercentage = 0;
        return categorySpending.map(([_, amount], index) => {
            const percentage = (amount / totalExpense) * 100;
            const start = cumulativePercentage;
            cumulativePercentage += percentage;
            const end = cumulativePercentage;
            return `${categoryHexColors[index % categoryHexColors.length]} ${start}% ${end}%`;
        }).join(', ');
    }, [categorySpending, totalExpense]);

    return (
        <section className={`${themeClasses.cardBg} p-6 rounded-lg`}>
            <h2 className={`text-2xl font-bold mb-6 border-b ${themeClasses.border} pb-3`}>카테고리별 소비 분석</h2>
            {categorySpending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center group"><div className="w-48 h-48 rounded-full transition-all duration-300 ease-out group-hover:scale-105" style={{ background: `conic-gradient(${conicGradientStops})`, filter: `drop-shadow(0 0 15px rgba(129, 140, 248, 0.4))` }}></div><div className="mt-6 w-full max-w-xs space-y-2">{categorySpending.map(([category, amount], index) => (<div key={category} className="flex items-center text-sm p-1 rounded-md transition-colors hover:bg-white/10"><span className={`w-3 h-3 rounded-sm mr-2 ${categoryTailwindColors[index % categoryTailwindColors.length]}`}></span><span className="font-semibold flex-1">{category}</span><span>{formatCurrency(amount)}</span></div>))}</div></div>
                    <div className="space-y-5">{categorySpending.map(([category, amount], index) => { const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0; return (<div key={category} className="group"><div className="flex justify-between items-center mb-1 font-semibold"><span>{category}</span><span>{percentage.toFixed(1)}%</span></div><div className={`w-full ${themeClasses.inputBg} rounded-full h-4 overflow-hidden`}><div className={`${categoryTailwindColors[index % categoryTailwindColors.length]} h-4 rounded-full transition-all duration-500 ease-out group-hover:brightness-125`} style={{ width: `${percentage}%` }}></div></div></div>); })}</div>
                </div>
            ) : <p className={themeClasses.secondaryText}>지출 내역이 없습니다.</p>}
        </section>
    );
};

// --- 메인 앱 컴포넌트 ---
export default function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('기타');
  const [isExpense, setIsExpense] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [theme, setTheme] = useState('dark');
  const [appTitle, setAppTitle] = useState('스마트 가계부');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeView, setActiveView] = useState('list');

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const summary = useMemo(() => {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0);
    return { total, income, expense };
  }, [transactions]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount.trim()) { alert("내용과 금액을 모두 입력해주세요."); return; }
    const newTransaction = { id: Date.now(), text, category, memo: '', amount: isExpense ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)), date: date, };
    setTransactions([newTransaction, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setText(''); setAmount(''); setCategory('기타'); setDate(new Date().toISOString().slice(0, 10));
  };

  const handleDeleteTransaction = (id) => { if (window.confirm("정말로 이 내역을 삭제하시겠습니까?")) setTransactions(transactions.filter(t => t.id !== id)); };
  const handleStartEdit = (t) => { setEditingId(t.id); setEditText(t.text); setEditAmount(Math.abs(t.amount)); setEditMemo(t.memo); };
  const handleCancelEdit = () => setEditingId(null);
  const handleUpdateTransaction = (id) => {
    const original = transactions.find(t => t.id === id);
    if (!original) return;
    const isOriginalExpense = original.amount < 0;
    setTransactions(transactions.map(t => t.id === id ? { ...t, text: editText, memo: editMemo, amount: isOriginalExpense ? -Math.abs(parseFloat(editAmount)) : Math.abs(parseFloat(editAmount)) } : t));
    setEditingId(null);
  };

  const formatCurrency = (num) => `${num.toLocaleString('ko-KR')}원`;

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    cardBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    inputBg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    secondaryText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    headerText: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600',
    memoText: theme === 'dark' ? 'text-indigo-300' : 'text-indigo-500',
    memoBg: theme === 'dark' ? 'bg-gray-700/50' : 'bg-indigo-50',
    icon: theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
  };

  return (
    <div className={`${themeClasses.bg} ${themeClasses.text} min-h-screen font-sans p-4 sm:p-8 flex justify-center transition-colors duration-300`}>
       <style>
        {`
          .custom-date-input::-webkit-calendar-picker-indicator {
            filter: ${theme === 'dark' ? 'invert(1)' : 'none'};
            cursor: pointer;
          }
        `}
      </style>
      <div className="w-full max-w-2xl relative">
        <button onClick={toggleTheme} className={`absolute top-0 right-0 p-2 rounded-full ${themeClasses.icon} focus:outline-none`}>
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <header className="mb-4 text-center pt-8">
          {isEditingTitle ? (<input type="text" value={appTitle} onChange={(e) => setAppTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }} className={`text-4xl font-bold ${themeClasses.headerText} bg-transparent text-center outline-none border-b-2 ${themeClasses.border} w-full max-w-md mx-auto`} autoFocus />) : (<h1 className={`text-4xl font-bold ${themeClasses.headerText} cursor-pointer hover:opacity-75`} onClick={() => setIsEditingTitle(true)} title="클릭해서 제목 수정">{appTitle}</h1>)}
        </header>
        <nav className={`flex justify-center p-1 rounded-lg ${themeClasses.inputBg} max-w-sm mx-auto mb-8`}>
            <button onClick={() => setActiveView('list')} className={`w-1/2 p-2 rounded-md flex items-center justify-center gap-2 transition-colors ${activeView === 'list' ? `${themeClasses.cardBg} font-semibold shadow` : ''}`}><List size={18} /> 거래 내역</button>
            <button onClick={() => setActiveView('analysis')} className={`w-1/2 p-2 rounded-md flex items-center justify-center gap-2 transition-colors ${activeView === 'analysis' ? `${themeClasses.cardBg} font-semibold shadow` : ''}`}><PieChart size={18} /> 소비 분석</button>
        </nav>
        {activeView === 'list' ? (
          <>
            <section className="mb-8"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className={`${themeClasses.cardBg} p-4 rounded-lg text-center shadow-lg shadow-indigo-500/40`}><h3 className={`${themeClasses.secondaryText} text-sm`}>총 잔액</h3><p className={`text-2xl font-bold ${summary.total >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(summary.total)}</p></div><div className={`${themeClasses.cardBg} p-4 rounded-lg text-center shadow-lg shadow-indigo-500/40`}><h3 className={`${themeClasses.secondaryText} text-sm`}>총 수입</h3><p className="text-2xl font-bold text-green-500">{formatCurrency(summary.income)}</p></div><div className={`${themeClasses.cardBg} p-4 rounded-lg text-center shadow-lg shadow-indigo-500/40`}><h3 className={`${themeClasses.secondaryText} text-sm`}>총 지출</h3><p className="text-2xl font-bold text-red-500">{formatCurrency(summary.expense)}</p></div></div></section>
            <section className={`mb-8 ${themeClasses.cardBg} p-6 rounded-lg`}>
              <h2 className={`text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}>새로운 내역 추가</h2>
              <form onSubmit={handleAddTransaction}>
                <div className="flex mb-4"><button type="button" onClick={() => setIsExpense(true)} className={`flex-1 p-2 rounded-l-md transition-colors ${isExpense ? 'bg-indigo-600 text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')}`}>지출</button><button type="button" onClick={() => setIsExpense(false)} className={`flex-1 p-2 rounded-r-md transition-colors ${!isExpense ? 'bg-indigo-600 text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')}`}>수입</button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="내용" className={`${themeClasses.inputBg} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full`}/><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="금액" className={`${themeClasses.inputBg} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full`}/></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className={`${themeClasses.inputBg} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full custom-date-input`}
                      style={{ colorScheme: theme }}
                    />
                    <div className="flex items-center gap-4">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${themeClasses.inputBg} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow`}><option>식비</option><option>교통</option><option>쇼핑</option><option>구독</option><option>경조사</option><option>급여</option><option>기타</option></select>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md flex items-center gap-2 transition-colors"><PlusCircle size={20} /> 추가</button>
                    </div>
                </div>
              </form>
            </section>
            <section>
              <h2 className={`text-xl font-semibold mb-4 border-b ${themeClasses.border} pb-2`}>거래 내역</h2>
              <ul className="space-y-3">{transactions.map(t => (<li key={t.id} className={`${themeClasses.cardBg} p-4 rounded-lg shadow-md`}>{editingId === t.id ? (<div className="space-y-3"><input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className={`w-full ${themeClasses.inputBg} p-2 rounded-md`}/><input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={`w-full ${themeClasses.inputBg} p-2 rounded-md`}/><textarea value={editMemo} onChange={(e) => setEditMemo(e.target.value)} placeholder="메모" className={`w-full ${themeClasses.inputBg} p-2 rounded-md h-16`}/><div className="flex justify-end gap-2"><button onClick={() => handleUpdateTransaction(t.id)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"><Check size={18}/></button><button onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full"><X size={18}/></button></div></div>) : (<div><div className="flex justify-between items-start"><div><span className={`text-xs ${themeClasses.secondaryText}`}>{t.date} | {t.category}</span><p className="font-semibold text-lg">{t.text}</p></div><div className="text-right"><p className={`font-bold text-lg ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(t.amount)}</p><div className="flex justify-end items-center gap-3 mt-1"><button onClick={() => handleStartEdit(t)} className={themeClasses.icon}><Edit size={16}/></button><button onClick={() => handleDeleteTransaction(t.id)} className={themeClasses.icon}><Trash2 size={16}/></button></div></div></div>{t.memo && (<p className={`text-sm ${themeClasses.memoText} ${themeClasses.memoBg} px-3 py-1 rounded-md mt-2`}><strong>메모:</strong> {t.memo}</p>)}</div>)}</li>))}</ul>
            </section>
          </>
        ) : (<AnalysisPage transactions={transactions} summary={summary} themeClasses={themeClasses} formatCurrency={formatCurrency} />)}
      </div>
    </div>
  );
}
