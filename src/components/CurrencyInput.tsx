import React from 'react';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, className, placeholder }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove everything that is not a digit
        const rawValue = e.target.value.replace(/\D/g, '');
        
        // Convert to number (divide by 100 to handle decimals)
        const numericValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
        
        onChange(numericValue);
    };

    const formatDisplayValue = (val: number) => {
        if (val === 0 || val === undefined || val === null) return '';
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            className={className}
            placeholder={placeholder}
            value={formatDisplayValue(value)}
            onChange={handleChange}
        />
    );
};

export default CurrencyInput;
