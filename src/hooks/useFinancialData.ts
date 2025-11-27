import { useReducer } from 'react';
import { AppState, Action, TithesReceiptData, PaymentSheetData, SavedDocument } from '../types';

const STORAGE_KEY = 'ibs_financial_data';

const initialTithesData: TithesReceiptData = {
    date: new Date().toISOString().split('T')[0],
    serviceType: 'DOMINGO',
    attendance: { men: 0, women: 0, children: 0 },
    entries: [],
    totalAmount: 0,
};

const initialPaymentData: PaymentSheetData = {
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: 'SEGUNDA',
    customDay: '',
    previousBalance: 0,
    entries: 0,
    extraEntries: [],
    expenses: [],
    totalAmount: 0,
};

const getInitialState = (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // Ensure documents array exists
            if (!Array.isArray(parsed.documents)) {
                parsed.documents = [];
            }

            // Ensure paymentData exists
            if (!parsed.paymentData) {
                parsed.paymentData = initialPaymentData;
            }

            // Migration: Ensure extraEntries is an array
            if (!Array.isArray(parsed.paymentData.extraEntries)) {
                parsed.paymentData.extraEntries = [];
            }

            // Ensure expenses is an array
            if (!Array.isArray(parsed.paymentData.expenses)) {
                parsed.paymentData.expenses = [];
            }

            // Ensure tithesData exists
            if (!parsed.tithesData) {
                parsed.tithesData = initialTithesData;
            }
            
            // Ensure tithesData.entries is an array
            if (!Array.isArray(parsed.tithesData.entries)) {
                parsed.tithesData.entries = [];
            }

            return {
                ...parsed,
                currentView: 'DASHBOARD', // Always start at dashboard
                activeDocumentId: null
            };
        } catch (e) {
            console.error('Failed to parse saved state', e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }
    return {
        currentView: 'DASHBOARD',
        tithesData: initialTithesData,
        paymentData: initialPaymentData,
        documents: [],
        activeDocumentId: null
    };
};

const calculateTithesTotal = (data: TithesReceiptData): number => {
    return data.entries.reduce((acc, curr) => acc + curr.value, 0);
};

const calculatePaymentTotal = (data: PaymentSheetData): number => {
    const expensesTotal = data.expenses.reduce((acc, curr) => acc + curr.value, 0);
    const extraEntriesTotal = data.extraEntries.reduce((acc, curr) => acc + curr.value, 0);
    return (data.previousBalance + data.entries + extraEntriesTotal) - expensesTotal;
};

const financialReducer = (state: AppState, action: Action): AppState => {
    let newState = state;
    switch (action.type) {
        case 'SET_VIEW':
            newState = { ...state, currentView: action.payload };
            break;
        
        case 'CREATE_NEW_DOCUMENT':
            newState = {
                ...state,
                currentView: action.payload,
                activeDocumentId: null,
                tithesData: action.payload === 'TITHES' ? initialTithesData : state.tithesData,
                paymentData: action.payload === 'PAYMENTS' ? initialPaymentData : state.paymentData
            };
            break;

        case 'SAVE_DOCUMENT': {
            const isTithes = state.currentView === 'TITHES';
            const currentData = isTithes ? state.tithesData : state.paymentData;
            const docId = state.activeDocumentId || Date.now().toString();
            
            const newDoc: SavedDocument = {
                id: docId,
                type: isTithes ? 'TITHES' : 'PAYMENTS',
                title: isTithes 
                    ? `Dízimos - ${(currentData as TithesReceiptData).date}` 
                    : `Pagamentos - ${(currentData as PaymentSheetData).date}`,
                date: new Date().toISOString(),
                lastModified: Date.now(),
                data: currentData
            };

            const existingDocIndex = state.documents.findIndex(d => d.id === docId);
            let newDocuments;
            
            if (existingDocIndex >= 0) {
                newDocuments = [...state.documents];
                newDocuments[existingDocIndex] = newDoc;
            } else {
                newDocuments = [newDoc, ...state.documents];
            }

            newState = {
                ...state,
                documents: newDocuments,
                activeDocumentId: docId
            };
            break;
        }

        case 'LOAD_DOCUMENT': {
            const doc = state.documents.find(d => d.id === action.payload);
            if (doc) {
                newState = {
                    ...state,
                    currentView: doc.type,
                    activeDocumentId: doc.id,
                    tithesData: doc.type === 'TITHES' ? (doc.data as TithesReceiptData) : state.tithesData,
                    paymentData: doc.type === 'PAYMENTS' ? (doc.data as PaymentSheetData) : state.paymentData
                };
            }
            break;
        }

        case 'DELETE_DOCUMENT':
            newState = {
                ...state,
                documents: state.documents.filter(d => d.id !== action.payload)
            };
            break;

        case 'UPDATE_TITHES_DATA': {
            const newData = { ...state.tithesData, ...action.payload };
            newState = { 
                ...state, 
                tithesData: { ...newData, totalAmount: calculateTithesTotal(newData) } 
            };
            break;
        }

        case 'ADD_TITHE_ENTRY': {
            const newEntries = [...state.tithesData.entries, action.payload];
            const newData = { ...state.tithesData, entries: newEntries };
            newState = { 
                ...state, 
                tithesData: { ...newData, totalAmount: calculateTithesTotal(newData) } 
            };
            break;
        }

        case 'REMOVE_TITHE_ENTRY': {
            const newEntries = state.tithesData.entries.filter(e => e.id !== action.payload);
            const newData = { ...state.tithesData, entries: newEntries };
            newState = { 
                ...state, 
                tithesData: { ...newData, totalAmount: calculateTithesTotal(newData) } 
            };
            break;
        }

        case 'UPDATE_PAYMENT_DATA': {
            const newData = { ...state.paymentData, ...action.payload };
            newState = { 
                ...state, 
                paymentData: { ...newData, totalAmount: calculatePaymentTotal(newData) } 
            };
            break;
        }

        case 'ADD_EXPENSE': {
            const newExpenses = [...state.paymentData.expenses, action.payload];
            const newData = { ...state.paymentData, expenses: newExpenses };
            newState = { 
                ...state, 
                paymentData: { ...newData, totalAmount: calculatePaymentTotal(newData) } 
            };
            break;
        }

        case 'REMOVE_EXPENSE': {
            const newExpenses = state.paymentData.expenses.filter(e => e.id !== action.payload);
            const newData = { ...state.paymentData, expenses: newExpenses };
            newState = { 
                ...state, 
                paymentData: { ...newData, totalAmount: calculatePaymentTotal(newData) } 
            };
            break;
        }

        case 'ADD_EXTRA_ENTRY': {
            const newExtraEntries = [...state.paymentData.extraEntries, action.payload];
            const newData = { ...state.paymentData, extraEntries: newExtraEntries };
            newState = { 
                ...state, 
                paymentData: { ...newData, totalAmount: calculatePaymentTotal(newData) } 
            };
            break;
        }

        case 'REMOVE_EXTRA_ENTRY': {
            const newExtraEntries = state.paymentData.extraEntries.filter(e => e.id !== action.payload);
            const newData = { ...state.paymentData, extraEntries: newExtraEntries };
            newState = { 
                ...state, 
                paymentData: { ...newData, totalAmount: calculatePaymentTotal(newData) } 
            };
            break;
        }

        default:
            return state;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
};

export const useFinancialData = () => {
    const [state, dispatch] = useReducer(financialReducer, undefined, getInitialState);

    return { state, dispatch };
};

