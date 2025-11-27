export interface Expense {
    id: string;
    date: string;
    description: string;
    value: number;
}

export interface TitheEntry {
    id: string;
    name?: string; // Optional contributor name
    value: number;
    type: 'DIZIMO' | 'OFERTA' | 'CAMPANHA' | 'CANTINA' | 'LIVRARIA' | 'OUTRO';
    paymentMethod?: 'DINHEIRO' | 'CHEQUE' | 'PIX';
}

export interface TithesReceiptData {
    date: string;
    serviceType: 'DOMINGO' | 'QUINTA' | 'SABADO' | 'OUTRO';
    otherServiceDescription?: string;
    attendance: {
        men: number;
        women: number;
        children: number;
    };
    entries: TitheEntry[];
    totalAmount: number;
}

export interface ExtraEntry {
    id: string;
    description: string;
    value: number;
}

export interface PaymentSheetData {
    date?: string; // YYYY-MM-DD
    dayOfWeek?: 'SEGUNDA' | 'SEXTA' | 'OUTRO';
    customDay?: string;
    previousBalance: number;
    entries: number; // From Tithes or manual
    extraEntries: ExtraEntry[];
    expenses: Expense[];
    totalAmount: number;
}

export interface SavedDocument {
    id: string;
    type: 'TITHES' | 'PAYMENTS';
    title: string;
    date: string;
    data: TithesReceiptData | PaymentSheetData;
    lastModified: number;
}

export interface AppState {
    currentView: 'DASHBOARD' | 'TITHES' | 'PAYMENTS';
    tithesData: TithesReceiptData;
    paymentData: PaymentSheetData;
    documents: SavedDocument[];
    activeDocumentId: string | null;
}

export type Action = 
    | { type: 'SET_VIEW'; payload: 'DASHBOARD' | 'TITHES' | 'PAYMENTS' }
    | { type: 'CREATE_NEW_DOCUMENT'; payload: 'TITHES' | 'PAYMENTS' }
    | { type: 'LOAD_DOCUMENT'; payload: string }
    | { type: 'SAVE_DOCUMENT' }
    | { type: 'DELETE_DOCUMENT'; payload: string }
    | { type: 'UPDATE_TITHES_DATA'; payload: Partial<TithesReceiptData> }
    | { type: 'ADD_TITHE_ENTRY'; payload: TitheEntry }
    | { type: 'REMOVE_TITHE_ENTRY'; payload: string }
    | { type: 'UPDATE_PAYMENT_DATA'; payload: Partial<PaymentSheetData> }
    | { type: 'ADD_EXPENSE'; payload: Expense }
    | { type: 'REMOVE_EXPENSE'; payload: string }
    | { type: 'ADD_EXTRA_ENTRY'; payload: ExtraEntry }
    | { type: 'REMOVE_EXTRA_ENTRY'; payload: string };
