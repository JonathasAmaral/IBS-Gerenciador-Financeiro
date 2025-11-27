import React from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';

interface ExpenseTableProps {
    expenses: Expense[];
    onRemove: (id: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onRemove }) => {
    return (
        <div className="overflow-x-auto border border-gray-300">
            <table className="min-w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead className="uppercase tracking-wider bg-gray-100">
                    <tr>
                        <th scope="col" className="px-4 py-2 text-gray-700 font-bold border border-gray-300">Data</th>
                        <th scope="col" className="px-4 py-2 text-gray-700 font-bold w-full border border-gray-300">Descrição</th>
                        <th scope="col" className="px-4 py-2 text-gray-700 font-bold text-right border border-gray-300">Valor</th>
                        <th scope="col" className="px-4 py-2 text-gray-700 font-bold border border-gray-300 w-10 pdf-exclude"></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700 border border-gray-300">{formatDate(expense.date)}</td>
                            <td className="px-4 py-2 text-gray-800 font-medium border border-gray-300">{expense.description}</td>
                            <td className="px-4 py-2 text-gray-800 font-bold text-right border border-gray-300">{formatCurrency(expense.value)}</td>
                            <td className="px-4 py-2 text-center border border-gray-300 pdf-exclude">
                                <button 
                                    onClick={() => onRemove(expense.id)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                    title="Remover"
                                >
                                    &times;
                                </button>
                            </td>
                        </tr>
                    ))}
                    {expenses.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic border border-gray-300">
                                Nenhuma despesa registrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseTable;