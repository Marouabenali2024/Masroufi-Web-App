import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats currency in TND
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(amount);
}
