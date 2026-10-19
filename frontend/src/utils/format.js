export const currency = (value) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const number = (value) => new Intl.NumberFormat('en-RW').format(Number(value || 0));

export const date = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '-');

export const dateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
