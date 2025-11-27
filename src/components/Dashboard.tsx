import React, { useState } from 'react';
import { SavedDocument } from '../types';
import ConfirmModal from './ConfirmModal';

interface Props {
    documents: SavedDocument[];
    onCreateNew: (type: 'TITHES' | 'PAYMENTS') => void;
    onOpenDocument: (id: string) => void;
    onDeleteDocument: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ documents, onCreateNew, onOpenDocument, onDeleteDocument }) => {
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; docId: string | null }>({
        isOpen: false,
        docId: null
    });

    // Sort documents by lastModified desc
    const sortedDocs = [...documents].sort((a, b) => b.lastModified - a.lastModified);

    const handleDeleteClick = (e: React.MouseEvent, docId: string) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, docId });
    };

    const handleConfirmDelete = () => {
        if (deleteModal.docId) {
            onDeleteDocument(deleteModal.docId);
            setDeleteModal({ isOpen: false, docId: null });
        }
    };

    const formatLastModified = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < oneDay) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            if (hours < 1) {
                const minutes = Math.floor(diff / (60 * 1000));
                if (minutes < 1) return 'Agora mesmo';
                return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
            }
            return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
        }
        
        return new Date(timestamp).toLocaleDateString('pt-BR');
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Financeiro IBS</h1>
                <p className="text-gray-500">Gerencie as entradas e saídas da igreja</p>
            </header>

            <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Criar Novo Documento
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => onCreateNew('TITHES')}
                        className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group text-left"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Entrada de Dízimos</h3>
                        <p className="text-sm text-gray-500">Registrar dízimos e ofertas de um culto.</p>
                    </button>

                    <button 
                        onClick={() => onCreateNew('PAYMENTS')}
                        className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group text-left"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Pagamentos Diversos</h3>
                        <p className="text-sm text-gray-500">Gerar folha de pagamentos e despesas.</p>
                    </button>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gray-400 rounded-full"></span>
                    Recentes
                </h2>
                
                {sortedDocs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Nenhum documento recente.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onOpenDocument(doc.id)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                            <div className="text-xs text-gray-500">ID: {doc.id.slice(-6)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                doc.type === 'TITHES' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {doc.type === 'TITHES' ? 'Dízimos' : 'Pagamentos'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatLastModified(doc.lastModified)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, doc.id)}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="Excluir Documento"
                message="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, docId: null })}
            />
        </div>
    );
};

export default Dashboard;
