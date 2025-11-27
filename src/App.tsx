import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import Layout from './components/Layout';
import { useFinancialData } from './hooks/useFinancialData';
import TithesReceipt from './components/TithesReceipt';
import PaymentSheet from './components/PaymentSheet';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import SaveOptionsModal from './components/SaveOptionsModal';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const { state, dispatch } = useFinancialData();
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleBack = () => {
    // Check if data is empty before saving (only for new documents)
    let shouldSave = true;
    
    if (!state.activeDocumentId) {
        if (state.currentView === 'TITHES') {
            const data = state.tithesData;
            const isEmpty = data.totalAmount === 0 && 
                           data.entries.length === 0 &&
                           data.attendance.men === 0 &&
                           data.attendance.women === 0 &&
                           data.attendance.children === 0;
            if (isEmpty) shouldSave = false;
        } else if (state.currentView === 'PAYMENTS') {
            const data = state.paymentData;
            const isEmpty = data.entries === 0 && 
                           data.previousBalance === 0 && 
                           data.expenses.length === 0 && 
                           (!data.extraEntries || data.extraEntries.length === 0);
            if (isEmpty) shouldSave = false;
        }
    }

    if (shouldSave) {
        dispatch({ type: 'SAVE_DOCUMENT' });
    }
    dispatch({ type: 'SET_VIEW', payload: 'DASHBOARD' });
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveAndExit = () => {
    dispatch({ type: 'SAVE_DOCUMENT' });
    setShowSaveModal(false);
    dispatch({ type: 'SET_VIEW', payload: 'DASHBOARD' });
    showToast('Documento salvo com sucesso!');
  };

  const handlePrint = () => {
    dispatch({ type: 'SAVE_DOCUMENT' }); // Save before printing
    setShowSaveModal(false);
    setTimeout(() => {
        window.print();
    }, 100);
  };

  const handleSavePdf = async () => {
    dispatch({ type: 'SAVE_DOCUMENT' });
    setShowSaveModal(false);
    
    try {
        // 1. Determine default path (Last used > Default filename)
        const lastSaveDir = localStorage.getItem('lastSaveDir');
        
        // Generate filename based on document type and date
        let baseName = 'documento';
        
        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            // Converts YYYY-MM-DD to DD-MM-YYYY
            return dateStr.split('-').reverse().join('-');
        };

        if (state.currentView === 'TITHES') {
            const date = formatDate(state.tithesData.date || '');
            baseName = `Recibo_Dizimo_Ofertas${date ? '_' + date : ''}`;
        } else if (state.currentView === 'PAYMENTS') {
            const date = formatDate(state.paymentData.date || '');
            baseName = `Pagamentos_Diversos${date ? '_' + date : ''}`;
        }
        // Sanitize filename
        const fileName = `${baseName.replace(/[\/\\:]/g, '-')}.pdf`;

        let defaultPath = fileName;

        if (lastSaveDir) {
            // Simple path join for Linux/Unix. For cross-platform, we'd need the path API.
            // Assuming Linux based on environment info.
            defaultPath = `${lastSaveDir}/${fileName}`;
        }

        // 2. Ask for file path
        const filePath = await save({
            defaultPath: defaultPath,
            filters: [{
                name: 'PDF',
                extensions: ['pdf']
            }]
        });

        if (!filePath) {
            return; // User cancelled
        }

        // 3. Save the directory for next time
        try {
            // Extract directory from filePath
            const separator = filePath.includes('\\') ? '\\' : '/';
            const directory = filePath.substring(0, filePath.lastIndexOf(separator));
            if (directory) {
                localStorage.setItem('lastSaveDir', directory);
            }
        } catch (e) {
            console.error('Error saving last directory:', e);
        }

        showToast('Gerando PDF... Aguarde.', 'success');
        
        // 4. Generate and Save
        setTimeout(async () => {
            try {
                const pagesCollection = document.getElementsByClassName('pdf-page');
                if (pagesCollection.length === 0) {
                    throw new Error('Nenhuma página encontrada.');
                }
                const pages = Array.from(pagesCollection) as HTMLElement[];

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();

                // Generate images in parallel to speed up
                const imagesData = await Promise.all(pages.map(page => 
                    toPng(page, {
                        pixelRatio: 1.5, // Reduced from 2.0 to 1.5 for faster generation
                        backgroundColor: '#ffffff',
                        width: 794, // Force A4 width in pixels (approx 210mm at 96dpi)
                        height: page.scrollHeight, // Capture full height
                        style: {
                            width: '210mm',
                            minHeight: '297mm', // Ensure min-height is respected
                            margin: '0',
                            boxShadow: 'none', // Remove shadow in the capture only
                            transform: 'none'
                        },
                        filter: (node) => {
                            // Exclude elements with 'pdf-exclude' class
                            if (node.classList && node.classList.contains('pdf-exclude')) {
                                return false;
                            }
                            return true;
                        }
                    })
                ));

                imagesData.forEach((imgData, i) => {
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    if (i > 0) pdf.addPage();
                    // Center the image horizontally if there's any discrepancy
                    const xOffset = (pdfWidth - 210) / 2; 
                    pdf.addImage(imgData, 'PNG', xOffset, 0, 210, imgHeight);
                });

                const pdfArrayBuffer = pdf.output('arraybuffer');
                const uint8Array = new Uint8Array(pdfArrayBuffer);

                await writeFile(filePath, uint8Array);
                showToast('PDF salvo com sucesso!', 'success');

            } catch (err: any) {
                console.error('PDF generation error:', err);
                showToast(`Erro na geração: ${err.message || err}`, 'error');
            }
        }, 100);

    } catch (err: any) {
        console.error('Save dialog error:', err);
        showToast(`Erro ao abrir salvar: ${err.message || err}`, 'error');
    }
  };

  if (state.currentView === 'DASHBOARD') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 pb-12">
          <Dashboard 
            documents={state.documents || []}
            onCreateNew={(type) => dispatch({ type: 'CREATE_NEW_DOCUMENT', payload: type })}
            onOpenDocument={(id) => dispatch({ type: 'LOAD_DOCUMENT', payload: id })}
            onDeleteDocument={(id) => {
              dispatch({ type: 'DELETE_DOCUMENT', payload: id });
              showToast('Documento excluído com sucesso!', 'success');
            }}
          />
        </div>
        <Toast 
          message={toast.message} 
          isVisible={toast.show} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
          type={toast.type}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pb-12">
        {/* Editor Header */}
        <div className="bg-white shadow-sm mb-8 print:hidden">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Voltar ao Painel
            </button>
            
            <div className="flex items-center gap-4 relative">
               <div className="relative">
                 <button
                   onClick={() => setShowHelpModal(!showHelpModal)}
                   className="text-yellow-500 hover:text-yellow-600 transition-colors p-2 rounded-full hover:bg-yellow-50"
                   title="Informações do Documento"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </button>
                 <HelpModal 
                    isOpen={showHelpModal}
                    onClose={() => setShowHelpModal(false)}
                    type={state.currentView as 'TITHES' | 'PAYMENTS'}
                  />
               </div>

               <span className="text-sm text-gray-500">
                 {state.activeDocumentId ? 'Editando documento salvo' : 'Novo documento (não salvo)'}
               </span>
               
               <div className="relative">
                 <button
                  onClick={handleSaveClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium flex items-center"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                   </svg>
                   Salvar
                 </button>
                 <SaveOptionsModal 
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    onSaveAndExit={handleSaveAndExit}
                    onPrint={handlePrint}
                    onSavePdf={handleSavePdf}
                  />
               </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {state.currentView === 'TITHES' ? (
            <TithesReceipt 
              data={state.tithesData}
              onUpdate={(data) => dispatch({ type: 'UPDATE_TITHES_DATA', payload: data })}
              onAddEntry={(entry) => dispatch({ type: 'ADD_TITHE_ENTRY', payload: entry })}
              onRemoveEntry={(id) => dispatch({ type: 'REMOVE_TITHE_ENTRY', payload: id })}
            />
          ) : (
            <PaymentSheet 
              data={state.paymentData}
              onUpdate={(data) => dispatch({ type: 'UPDATE_PAYMENT_DATA', payload: data })}
              onAddExpense={(expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense })}
              onRemoveExpense={(id) => dispatch({ type: 'REMOVE_EXPENSE', payload: id })}
              onAddExtraEntry={(entry) => dispatch({ type: 'ADD_EXTRA_ENTRY', payload: entry })}
              onRemoveExtraEntry={(id) => dispatch({ type: 'REMOVE_EXTRA_ENTRY', payload: id })}
            />
          )}
        </div>
        <Toast 
          message={toast.message} 
          isVisible={toast.show} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
          type={toast.type}
        />
      </div>
    </Layout>
  );
};

export default App;

