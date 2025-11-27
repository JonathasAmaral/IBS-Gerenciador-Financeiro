export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    // Assuming input is YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
};
