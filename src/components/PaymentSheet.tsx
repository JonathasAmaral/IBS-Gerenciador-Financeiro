import React, { useState } from 'react';
import { PaymentSheetData, Expense, ExtraEntry } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import ExpenseTable from './ExpenseTable';
import CustomDateInput from './CustomDateInput';
import CurrencyInput from './CurrencyInput';

interface Props {
    data: PaymentSheetData;
    onUpdate: (data: Partial<PaymentSheetData>) => void;
    onAddExpense: (expense: Expense) => void;
    onRemoveExpense: (id: string) => void;
    onAddExtraEntry: (entry: ExtraEntry) => void;
    onRemoveExtraEntry: (id: string) => void;
}

const PaymentSheet: React.FC<Props> = ({ 
    data, 
    onUpdate, 
    onAddExpense, 
    onRemoveExpense,
    onAddExtraEntry,
    onRemoveExtraEntry
}) => {
    const [newExpense, setNewExpense] = useState<{ date: string; description: string; value: number }>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        value: 0
    });

    const [showExtraEntries, setShowExtraEntries] = useState(false);
    const [newExtraEntry, setNewExtraEntry] = useState<{ description: string; value: number }>({
        description: '',
        value: 0
    });
    const [showExpenseInput, setShowExpenseInput] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);

    const handleAddExpense = () => {
        if (!newExpense.description) {
            setDescriptionError(true);
            return;
        }
        if (!newExpense.value) return;
        onAddExpense({
            id: Date.now().toString(),
            date: newExpense.date,
            description: newExpense.description,
            value: newExpense.value
        });
        setNewExpense({ ...newExpense, description: '', value: 0 });
        setDescriptionError(false);
    };

    const handleAddExtraEntry = () => {
        if (!newExtraEntry.value) return;
        onAddExtraEntry({
            id: Date.now().toString(),
            description: newExtraEntry.description || 'Entrada Extra',
            value: newExtraEntry.value
        });
        setNewExtraEntry({ description: '', value: 0 });
    };

    const extraEntries = data.extraEntries || [];
    const extraEntriesTotal = extraEntries.reduce((acc, curr) => acc + curr.value, 0);
    const totalAvailable = data.previousBalance + data.entries + extraEntriesTotal;
    const totalExpenses = (data.expenses || []).reduce((acc, curr) => acc + curr.value, 0);

    // Pagination Logic
    const A4_HEIGHT_PX = 1123; // Approx A4 height at 96dpi
    const HEADER_HEIGHT = 200;
    const TOP_SECTION_BASE_HEIGHT = 300;
    const EXTRA_ENTRY_HEIGHT = 30;
    const FOOTER_HEIGHT = 200;
    const TABLE_HEADER_HEIGHT = 50;
    const ROW_HEIGHT = 45;
    const PADDING = 80;

    const topSectionHeight = TOP_SECTION_BASE_HEIGHT + (extraEntries.length * EXTRA_ENTRY_HEIGHT);
    const availableHeightPage1 = A4_HEIGHT_PX - PADDING - HEADER_HEIGHT - topSectionHeight - TABLE_HEADER_HEIGHT - FOOTER_HEIGHT;
    const maxRowsPage1 = Math.max(5, Math.floor(availableHeightPage1 / ROW_HEIGHT));

    const availableHeightPageN = A4_HEIGHT_PX - PADDING - HEADER_HEIGHT - TABLE_HEADER_HEIGHT - FOOTER_HEIGHT;
    const maxRowsPageN = Math.floor(availableHeightPageN / ROW_HEIGHT);

    const pages = [];
    let remainingExpenses = [...(data.expenses || [])];

    // First Page
    const page1Expenses = remainingExpenses.splice(0, maxRowsPage1);
    pages.push({
        id: 1,
        expenses: page1Expenses,
        isFirst: true,
        isLast: remainingExpenses.length === 0
    });

    // Subsequent Pages
    let pageNum = 2;
    while (remainingExpenses.length > 0) {
        const pageExpenses = remainingExpenses.splice(0, maxRowsPageN);
        pages.push({
            id: pageNum,
            expenses: pageExpenses,
            isFirst: false,
            isLast: remainingExpenses.length === 0
        });
        pageNum++;
    }

    return (
        <div id="document-content" className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
            {pages.map((page) => (
                <div 
                    key={page.id} 
                    className="bg-white shadow-lg mx-auto mb-8 relative flex flex-col print:shadow-none print:mb-0 print:break-after-page pdf-page" 
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm', 
                        padding: '10mm' 
                    }}
                >
                    
                    <div className="flex-grow">
                    {/* Header (Repeated on all pages, maybe simplified on subsequent) */}
                    <div className="text-center mb-4 border-b-2 border-gray-800 pb-4">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">IGREJA BÍBLICA SEMEAR</h1>
                        <p className="text-sm text-gray-500 uppercase tracking-wider">PAGAMENTOS DIVERSOS {pages.length > 1 && `(${page.id}/${pages.length})`}</p>
                    </div>
                        
                    <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-700 print:text-black mb-8">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">DATA:</span>
                            <div className="relative">
                                <CustomDateInput 
                                    value={data.date || ''}
                                    onChange={(e) => onUpdate({ date: e.target.value })}
                                    className="border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent px-1 font-mono w-32 text-center cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div 
                                className="flex items-center gap-1 cursor-pointer group"
                                onClick={() => onUpdate({ dayOfWeek: 'SEGUNDA' })}
                            >
                                <div className={`w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ${data.dayOfWeek === 'SEGUNDA' ? 'bg-blue-600 border-blue-600' : ''}`}>
                                    {data.dayOfWeek === 'SEGUNDA' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="group-hover:text-blue-600">Segunda</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <div 
                                className="flex items-center gap-1 cursor-pointer group"
                                onClick={() => onUpdate({ dayOfWeek: 'SEXTA' })}
                            >
                                <div className={`w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ${data.dayOfWeek === 'SEXTA' ? 'bg-blue-600 border-blue-600' : ''}`}>
                                    {data.dayOfWeek === 'SEXTA' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="group-hover:text-blue-600">Sexta</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <div className="flex items-center gap-1 cursor-pointer group">
                                <div 
                                    className={`w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center ${data.dayOfWeek === 'OUTRO' ? 'bg-blue-600 border-blue-600' : ''}`}
                                    onClick={() => onUpdate({ dayOfWeek: 'OUTRO' })}
                                >
                                    {data.dayOfWeek === 'OUTRO' && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <input 
                                    type="text" 
                                    value={data.customDay || ''}
                                    onChange={(e) => onUpdate({ dayOfWeek: 'OUTRO', customDay: e.target.value })}
                                    onClick={() => onUpdate({ dayOfWeek: 'OUTRO' })}
                                    placeholder="Outro"
                                    className="border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent px-1 font-mono w-24 text-center"
                                />
                            </div>
                        </div>
                    </div>

                    {page.isFirst && (
                        <>
                            {/* Top Section: Financial Summary & Inputs */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                                {/* Row 1: Entries, Previous Balance, Subtotal */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Entradas (Dízimos)</label>
                                        <CurrencyInput 
                                            value={data.entries}
                                            onChange={(val) => onUpdate({ entries: val })}
                                            className="w-full p-2 bg-white border border-gray-300 rounded text-right font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Saldo Anterior</label>
                                        <CurrencyInput 
                                            value={data.previousBalance}
                                            onChange={(val) => onUpdate({ previousBalance: val })}
                                            className="w-full p-2 bg-white border border-gray-300 rounded text-right font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Total</label>
                                        <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-right font-mono font-bold text-blue-700">
                                            {formatCurrency(totalAvailable)}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Extra Entries */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2 print:hidden pdf-exclude">
                                        <label className="block text-xs font-bold text-gray-600 uppercase">Entradas Extras</label>
                                        <button 
                                            onClick={() => setShowExtraEntries(!showExtraEntries)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {showExtraEntries ? 'Ocultar' : 'Adicionar'}
                                        </button>
                                    </div>
                                    <div className="hidden print:block mb-2">
                                        <label className="block text-xs font-bold text-gray-600 uppercase">Entradas Extras</label>
                                    </div>
                                    
                                    {showExtraEntries && (
                                        <div className="mb-3 bg-gray-50 p-4 rounded border border-gray-200 print:hidden pdf-exclude">
                                            <div className="grid grid-cols-12 gap-4 items-end">
                                                <div className="col-span-6">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Entrada Extra"
                                                        className="w-full p-2 border rounded"
                                                        value={newExtraEntry.description}
                                                        onChange={(e) => setNewExtraEntry({...newExtraEntry, description: e.target.value})}
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                                                    <CurrencyInput 
                                                        placeholder="0,00" 
                                                        className="w-full p-2 border rounded"
                                                        value={newExtraEntry.value}
                                                        onChange={(val) => setNewExtraEntry({...newExtraEntry, value: val})}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <button 
                                                        onClick={handleAddExtraEntry} 
                                                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-x-auto border border-gray-300 rounded bg-white">
                                        <table className="min-w-full text-left text-sm whitespace-nowrap border-collapse">
                                            <thead className="uppercase tracking-wider bg-gray-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-gray-700 font-bold border border-gray-300">Descrição</th>
                                                    <th scope="col" className="px-4 py-2 text-gray-700 font-bold text-right border border-gray-300 w-32">Valor</th>
                                                    <th scope="col" className="px-4 py-2 text-gray-700 font-bold border border-gray-300 w-10 print:hidden pdf-exclude"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {extraEntries.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-400 italic border border-gray-300">
                                                            Nenhuma entrada extra.
                                                        </td>
                                                    </tr>
                                                )}
                                                {extraEntries.map(entry => (
                                                    <tr key={entry.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-gray-600 border border-gray-300">{entry.description}</td>
                                                        <td className="px-4 py-2 text-gray-800 font-mono font-medium text-right border border-gray-300">{formatCurrency(entry.value)}</td>
                                                        <td className="px-4 py-2 text-center border border-gray-300 print:hidden pdf-exclude">
                                                            <button 
                                                                onClick={() => onRemoveExtraEntry(entry.id)}
                                                                className="text-red-500 hover:text-red-700 font-bold"
                                                                title="Remover"
                                                            >
                                                                &times;
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {extraEntries.length > 0 && (
                                        <div className="flex justify-end mt-2">
                                            <span className="text-xs text-gray-500 mr-2">Total Extras:</span>
                                            <span className="text-xs font-mono font-bold text-gray-700">{formatCurrency(extraEntriesTotal)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Input Form (Only on first page, hidden in print if empty) */}
                            <div className="mb-8 print:hidden pdf-exclude">
                                <div className="mb-4 flex justify-between items-end">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                        Despesas
                                    </h3>
                                    <button 
                                        onClick={() => setShowExpenseInput(!showExpenseInput)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        {showExpenseInput ? 'Ocultar' : 'Adicionar'}
                                    </button>
                                </div>
                                
                                {showExpenseInput && (
                                <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
                                            <CustomDateInput 
                                                value={newExpense.date}
                                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                                className="w-full p-2 border rounded bg-white cursor-pointer"
                                            />
                                        </div>
                                        <div className="md:col-span-6">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-medium text-gray-500">Descrição</label>
                                                {descriptionError && (
                                                    <span className="text-xs text-red-500 animate-fade-in font-medium">
                                                        Por favor, adicione uma descrição
                                                    </span>
                                                )}
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Descrição da despesa"
                                                value={newExpense.description}
                                                onChange={(e) => {
                                                    setNewExpense({ ...newExpense, description: e.target.value });
                                                    if (descriptionError) setDescriptionError(false);
                                                }}
                                                className={`w-full p-2 border rounded ${descriptionError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                                            <CurrencyInput 
                                                value={newExpense.value}
                                                onChange={(value) => setNewExpense({ ...newExpense, value })}
                                                className="w-full p-2 border rounded"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <button 
                                                onClick={handleAddExpense}
                                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Expenses Table */}
                    <div className="mb-8">
                        <ExpenseTable expenses={page.expenses} onRemove={onRemoveExpense} />
                    </div>
                    </div>

                    {/* Footer (Only on last page) */}
                    {page.isLast && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200 mt-auto">
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Total Disponível:</span>
                                    <span className="font-medium">{formatCurrency(totalAvailable)}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Total Despesas:</span>
                                    <span className="font-medium">- {formatCurrency(totalExpenses)}</span>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-lg flex flex-col justify-center items-center text-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Valor Total em Caixa</span>
                                <span className={`text-3xl font-bold ${data.totalAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.totalAmount)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PaymentSheet;
