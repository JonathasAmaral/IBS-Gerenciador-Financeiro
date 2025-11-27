import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';

// Register Portuguese locale
registerLocale('pt-BR', ptBR);

interface Props {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    className?: string;
    placeholder?: string;
}

const CustomDateInput: React.FC<Props> = ({ value, onChange, className, placeholder }) => {
    // Convert YYYY-MM-DD string to Date object (handling timezone issues)
    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const handleChange = (date: Date | null) => {
        if (!date) {
            onChange({ target: { value: '' } });
            return;
        }
        // Format to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        onChange({ target: { value: dateString } });
    };

    return (
        <div className="w-full custom-datepicker-wrapper">
            <DatePicker
                selected={parseDate(value)}
                onChange={handleChange}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                className={className}
                placeholderText={placeholder || "dd/mm/aaaa"}
                wrapperClassName="w-full"
            />
        </div>
    );
};

export default CustomDateInput;
