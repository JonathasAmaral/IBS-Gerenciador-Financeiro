import React, { useState } from 'react';
import { TithesReceiptData, TitheEntry } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import CustomDateInput from './CustomDateInput';
import CurrencyInput from './CurrencyInput';

interface Props {
    data: TithesReceiptData;
    onUpdate: (data: Partial<TithesReceiptData>) => void;
    onAddEntry: (entry: TitheEntry) => void;
    onRemoveEntry: (id: string) => void;
}

const TithesReceipt: React.FC<Props> = ({ data, onUpdate }) => {
    const [servicePeriod, setServicePeriod] = useState<'M' | 'N'>('N'); // Manhã / Noite

    const handleSummaryUpdate = (
        type: 'DIZIMO' | 'CAMPANHA' | 'CANTINA' | 'LIVRARIA',
        paymentMethod: 'DINHEIRO' | 'CHEQUE',
        value: number
    ) => {
        const id = `summary_${type.toLowerCase()}_${paymentMethod.toLowerCase()}`;
        
        // Remove existing entry for this slot
        const otherEntries = data.entries.filter(e => e.id !== id);
        
        if (value > 0) {
            const newEntry: TitheEntry = {
                id,
                type,
                paymentMethod,
                value,
                name: 'Resumo Manual'
            };
            onUpdate({ entries: [...otherEntries, newEntry] });
        } else {
            onUpdate({ entries: otherEntries });
        }
    };

    // Calculate totals
    const totals = {
        dizimo: data.entries.filter(e => e.type === 'DIZIMO').reduce((acc, curr) => acc + curr.value, 0),
        oferta: data.entries.filter(e => e.type === 'OFERTA').reduce((acc, curr) => acc + curr.value, 0),
        campanha: data.entries.filter(e => e.type === 'CAMPANHA').reduce((acc, curr) => acc + curr.value, 0),
        cantina: data.entries.filter(e => e.type === 'CANTINA').reduce((acc, curr) => acc + curr.value, 0),
        livraria: data.entries.filter(e => e.type === 'LIVRARIA').reduce((acc, curr) => acc + curr.value, 0),
        outro: data.entries.filter(e => e.type === 'OUTRO').reduce((acc, curr) => acc + curr.value, 0),
        dinheiro: data.entries.filter(e => e.paymentMethod === 'DINHEIRO' || !e.paymentMethod).reduce((acc, curr) => acc + curr.value, 0),
        cheque: data.entries.filter(e => e.paymentMethod === 'CHEQUE').reduce((acc, curr) => acc + curr.value, 0),
        pix: data.entries.filter(e => e.paymentMethod === 'PIX').reduce((acc, curr) => acc + curr.value, 0),

        // Granular totals for the new footer layout
        campanha_dinheiro: data.entries.filter(e => e.type === 'CAMPANHA' && (e.paymentMethod === 'DINHEIRO' || !e.paymentMethod)).reduce((acc, curr) => acc + curr.value, 0),
        campanha_cheque: data.entries.filter(e => e.type === 'CAMPANHA' && e.paymentMethod === 'CHEQUE').reduce((acc, curr) => acc + curr.value, 0),
        
        cantina_dinheiro: data.entries.filter(e => e.type === 'CANTINA' && (e.paymentMethod === 'DINHEIRO' || !e.paymentMethod)).reduce((acc, curr) => acc + curr.value, 0),
        cantina_cheque: data.entries.filter(e => e.type === 'CANTINA' && e.paymentMethod === 'CHEQUE').reduce((acc, curr) => acc + curr.value, 0),
        
        livraria_dinheiro: data.entries.filter(e => e.type === 'LIVRARIA' && (e.paymentMethod === 'DINHEIRO' || !e.paymentMethod)).reduce((acc, curr) => acc + curr.value, 0),
        livraria_cheque: data.entries.filter(e => e.type === 'LIVRARIA' && e.paymentMethod === 'CHEQUE').reduce((acc, curr) => acc + curr.value, 0),
        
        // General (Dizimo, Oferta, Outro)
        geral_dinheiro: data.entries.filter(e => ['DIZIMO', 'OFERTA', 'OUTRO'].includes(e.type) && (e.paymentMethod === 'DINHEIRO' || !e.paymentMethod)).reduce((acc, curr) => acc + curr.value, 0),
        geral_cheque: data.entries.filter(e => ['DIZIMO', 'OFERTA', 'OUTRO'].includes(e.type) && e.paymentMethod === 'CHEQUE').reduce((acc, curr) => acc + curr.value, 0),
    };

    return (
        <div 
            id="document-content" 
            className="bg-white p-8 shadow-lg rounded-lg mx-auto pdf-page flex flex-col w-full max-w-[210mm]"
            style={{ 
                minHeight: '297mm',
                padding: '10mm'
            }}
        >
            <div className="flex-grow">
                {/* Header Section */}
                <div className="mb-4 text-center border-b-2 border-gray-800 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">IGREJA BÍBLICA SEMEAR</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">RECIBO DE ENTRADA DE DÍZIMO E OFERTAS</p>
                </div>

                {/* Info Section: CNPJ/Address & Date */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-xs text-gray-600 font-mono mb-1">CNPJ: 70.098.553/0001-04</p>
                        <p className="text-xs text-gray-600 font-mono">ENDEREÇO: R. Vigário Calixto 1555 Catolé - Campina Grande</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">DATA:</span>
                        <div className="w-40 border-b border-gray-800">
                            <CustomDateInput 
                                value={data.date}
                                onChange={(e) => onUpdate({ date: e.target.value })}
                                className="w-full bg-transparent outline-none text-center font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Boxes Section */}
                <div className="flex gap-6 mb-8">
                    {/* Service Box */}
                    <div className="border border-gray-800 p-4 flex-1">
                        <div className="flex items-center justify-between mb-3 text-sm">
                            <span className="font-bold">Domingo:</span>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <span className="text-xs font-bold">Manhã</span>
                                    <div 
                                        className={`w-5 h-5 border border-gray-800 flex items-center justify-center ${data.serviceType === 'DOMINGO' && servicePeriod === 'M' ? 'bg-gray-800 text-white' : ''}`}
                                        onClick={() => { onUpdate({ serviceType: 'DOMINGO' }); setServicePeriod('M'); }}
                                    >
                                        {data.serviceType === 'DOMINGO' && servicePeriod === 'M' && '✓'}
                                    </div>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <span className="text-xs font-bold">Noite</span>
                                    <div 
                                        className={`w-5 h-5 border border-gray-800 flex items-center justify-center ${data.serviceType === 'DOMINGO' && servicePeriod === 'N' ? 'bg-gray-800 text-white' : ''}`}
                                        onClick={() => { onUpdate({ serviceType: 'DOMINGO' }); setServicePeriod('N'); }}
                                    >
                                        {data.serviceType === 'DOMINGO' && servicePeriod === 'N' && '✓'}
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-3 text-sm">
                            <span>Quinta-Feira</span>
                            <div 
                                className={`w-5 h-5 border border-gray-800 flex items-center justify-center cursor-pointer ${data.serviceType === 'QUINTA' ? 'bg-gray-800 text-white' : ''}`}
                                onClick={() => onUpdate({ serviceType: 'QUINTA' })}
                            >
                                {data.serviceType === 'QUINTA' && '✓'}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-3 text-sm">
                            <span>Sábado</span>
                            <div 
                                className={`w-5 h-5 border border-gray-800 flex items-center justify-center cursor-pointer ${data.serviceType === 'SABADO' ? 'bg-gray-800 text-white' : ''}`}
                                onClick={() => onUpdate({ serviceType: 'SABADO' })}
                            >
                                {data.serviceType === 'SABADO' && '✓'}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 flex-1 mr-2">
                                <input 
                                    type="text"
                                    placeholder="Outro"
                                    className="border-b border-gray-800 w-24 bg-transparent outline-none text-xs font-mono uppercase placeholder-gray-800"
                                    value={data.otherServiceDescription || ''}
                                    onChange={(e) => onUpdate({ serviceType: 'OUTRO', otherServiceDescription: e.target.value })}
                                    onFocus={() => onUpdate({ serviceType: 'OUTRO' })}
                                />
                            </div>
                            <div 
                                className={`w-5 h-5 border border-gray-800 flex items-center justify-center cursor-pointer ${data.serviceType === 'OUTRO' ? 'bg-gray-800 text-white' : ''}`}
                                onClick={() => onUpdate({ serviceType: 'OUTRO' })}
                            >
                                {data.serviceType === 'OUTRO' && '✓'}
                            </div>
                        </div>
                    </div>

                    {/* Counters Box */}
                    <div className="border border-gray-800 p-4 flex-1 flex flex-col justify-between min-h-[160px]">
                        <p className="text-sm font-bold text-center mb-4 uppercase leading-tight">Participantes da Contagem:</p>
                        <div className="space-y-8">
                            <div className="flex gap-2 items-end">
                                <span className="text-sm font-bold">1)</span>
                                <div className="border-b border-gray-400 flex-1 h-6"></div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <span className="text-sm font-bold">2)</span>
                                <div className="border-b border-gray-400 flex-1 h-6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Entries Section - Input Grid */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 gap-x-0 gap-y-8">
                        {/* Row 1 */}
                        <div className="px-4">
                            <div className="text-center h-6 mb-6">
                                <span className="font-bold text-gray-800 uppercase border-b border-gray-800 inline-block">DÍZIMOS E OFERTAS</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Dinheiro</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.geral_dinheiro}
                                        onChange={(value) => handleSummaryUpdate('DIZIMO', 'DINHEIRO', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Cheque</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.geral_cheque}
                                        onChange={(value) => handleSummaryUpdate('DIZIMO', 'CHEQUE', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            {/* Extra lines */}
                            <div className="border-b border-gray-400 h-6"></div>
                        </div>

                        <div className="px-4">
                            <div className="text-center h-6 mb-6">
                                <span className="font-bold text-gray-800 uppercase border-b border-gray-800 inline-block">CAMPANHA</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Dinheiro</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.campanha_dinheiro}
                                        onChange={(value) => handleSummaryUpdate('CAMPANHA', 'DINHEIRO', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Cheque</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.campanha_cheque}
                                        onChange={(value) => handleSummaryUpdate('CAMPANHA', 'CHEQUE', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            {/* Extra lines */}
                            <div className="border-b border-gray-400 h-6"></div>
                        </div>

                        {/* Row 2 */}
                        <div className="px-4">
                            <div className="text-center h-6 mb-6">
                                <span className="font-bold text-gray-800 uppercase border-b border-gray-800 inline-block">CANTINA</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Dinheiro</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.cantina_dinheiro}
                                        onChange={(value) => handleSummaryUpdate('CANTINA', 'DINHEIRO', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Cheque</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.cantina_cheque}
                                        onChange={(value) => handleSummaryUpdate('CANTINA', 'CHEQUE', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-4">
                            <div className="text-center h-6 mb-6">
                                <span className="font-bold text-gray-800 uppercase border-b border-gray-800 inline-block">LIVRARIA</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Dinheiro</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.livraria_dinheiro}
                                        onChange={(value) => handleSummaryUpdate('LIVRARIA', 'DINHEIRO', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Cheque</span>
                                <div className="flex items-center border-b border-gray-400 w-48 focus-within:border-blue-500">
                                    <span className="text-gray-900 font-bold mr-1">R$</span>
                                    <CurrencyInput 
                                        value={totals.livraria_cheque}
                                        onChange={(value) => handleSummaryUpdate('LIVRARIA', 'CHEQUE', value)}
                                        className="w-full text-right font-mono font-bold text-gray-900 leading-none bg-transparent focus:outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Summary Section */}
            <div className="mt-auto">
                <div className="border-2 border-gray-800 p-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase mb-2 border-b border-gray-400 pb-1">ENTRADAS</h3>
                    
                    <div className="grid grid-cols-2 gap-8">
                        {/* Left Column: Categories */}
                        <div>
                            {totals.dizimo > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">DÍZIMOS:</span>
                                    <span className="font-mono">{formatCurrency(totals.dizimo)}</span>
                                </div>
                            )}
                            {totals.oferta > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">OFERTAS:</span>
                                    <span className="font-mono">{formatCurrency(totals.oferta)}</span>
                                </div>
                            )}
                            {totals.campanha > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">CAMPANHA:</span>
                                    <span className="font-mono">{formatCurrency(totals.campanha)}</span>
                                </div>
                            )}
                            {totals.cantina > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">CANTINA:</span>
                                    <span className="font-mono">{formatCurrency(totals.cantina)}</span>
                                </div>
                            )}
                            {totals.livraria > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">LIVRARIA:</span>
                                    <span className="font-mono">{formatCurrency(totals.livraria)}</span>
                                </div>
                            )}
                            {totals.outro > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600">OUTROS:</span>
                                    <span className="font-mono">{formatCurrency(totals.outro)}</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Payment Methods & Total */}
                        <div>
                            <div className="bg-gray-100 p-2 rounded mb-2">
                                {totals.dinheiro > 0 && (
                                    <div className="flex justify-between items-center py-1 text-sm">
                                        <span className="font-bold text-gray-600">EM DINHEIRO:</span>
                                        <span className="font-mono">{formatCurrency(totals.dinheiro)}</span>
                                    </div>
                                )}
                                {totals.cheque > 0 && (
                                    <div className="flex justify-between items-center py-1 text-sm">
                                        <span className="font-bold text-gray-600">EM CHEQUE:</span>
                                        <span className="font-mono">{formatCurrency(totals.cheque)}</span>
                                    </div>
                                )}
                                {totals.pix > 0 && (
                                    <div className="flex justify-between items-center py-1 text-sm">
                                        <span className="font-bold text-gray-600">EM PIX:</span>
                                        <span className="font-mono">{formatCurrency(totals.pix)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t-2 border-gray-800 mt-2">
                                <span className="text-lg font-bold text-gray-900 uppercase">TOTAL:</span>
                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TithesReceipt;
