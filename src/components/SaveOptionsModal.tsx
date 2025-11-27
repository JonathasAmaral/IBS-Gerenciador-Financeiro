import React from 'react';

interface SaveOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveAndExit: () => void;
    onPrint: () => void;
    onSavePdf: () => void;
}

const SaveOptionsModal: React.FC<SaveOptionsModalProps> = ({ isOpen, onClose, onSaveAndExit, onPrint, onSavePdf }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in-up">
                <div className="p-2">
                    <button 
                        onClick={onSaveAndExit}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group text-left mb-1"
                    >
                        <div className="bg-blue-100 p-2 rounded-full mr-3 group-hover:bg-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">Salvar e Sair</div>
                            <div className="text-xs text-gray-500">Volta para o painel</div>
                        </div>
                    </button>

                    <button 
                        onClick={onPrint}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left mb-1"
                    >
                        <div className="bg-gray-100 p-2 rounded-full mr-3 group-hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">Imprimir</div>
                            <div className="text-xs text-gray-500">Imprimir documento</div>
                        </div>
                    </button>

                    <button 
                        onClick={onSavePdf}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors group text-left"
                    >
                        <div className="bg-red-100 p-2 rounded-full mr-3 group-hover:bg-red-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">Salvar PDF</div>
                            <div className="text-xs text-gray-500">Baixar arquivo PDF</div>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SaveOptionsModal;
