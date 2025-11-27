import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'TITHES' | 'PAYMENTS';
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in-up">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-bold text-gray-800 text-sm">Informações do Documento</h3>
                    </div>
                    
                    <div className="space-y-3 text-xs text-gray-600">
                        {type === 'PAYMENTS' ? (
                            <>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                    <p className="font-bold text-gray-800 mb-1">Total (Saldo + Entradas)</p>
                                    <p>É a soma de:</p>
                                    <ul className="list-disc list-inside ml-1 mt-1 text-gray-500">
                                        <li>Saldo Anterior</li>
                                        <li>Entradas (Dízimos)</li>
                                        <li>Entradas Extras</li>
                                    </ul>
                                    <p className="mt-2 text-gray-500 italic">
                                        Nota: Clique em "Adicionar" nas seções de Entradas Extras ou Despesas para exibir os campos de preenchimento.
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                    <p className="font-bold text-gray-800 mb-1">Total em Caixa</p>
                                    <p>É o resultado de:</p>
                                    <p className="mt-1 font-mono bg-white p-1 rounded border border-gray-300 inline-block w-full text-center">
                                        Total Disponível - Total de Despesas
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <p className="font-bold text-gray-800 mb-1">Total Geral</p>
                                <p>É a soma simples de todas as entradas (Dízimos e Ofertas) listadas no recibo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpModal;
