import { PaymentMethod } from '../types';

export interface PaymentOptionConfig {
  id: PaymentMethod;
  name: string;
  subtitle: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  instruction: string;
  requiresInput?: boolean;
}

export const PAYMENT_OPTIONS: PaymentOptionConfig[] = [
  {
    id: 'zelle',
    name: 'Zelle',
    subtitle: 'Direct Bank Transfer',
    inputLabel: 'Zelle Account Name or Phone Number (Optional)',
    inputPlaceholder: 'e.g. Account holder name',
    instruction: 'The payment instructions will be sent to you after the order is received on how to pay.',
    requiresInput: false,
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    subtitle: '$Cashtag Payment',
    inputLabel: 'Your Cash App $Cashtag (Optional)',
    inputPlaceholder: 'e.g. $RobertTrucking',
    instruction: 'The payment instructions will be sent to you after the order is received on how to pay.',
    requiresInput: false,
  },
  {
    id: 'chime',
    name: 'Chime',
    subtitle: 'Chime Transfer',
    inputLabel: 'Your Chime Tag or Phone Number (Optional)',
    inputPlaceholder: 'e.g. Payment handle',
    instruction: 'The payment instructions will be sent to you after the order is received on how to pay.',
    requiresInput: false,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    subtitle: 'Apple Pay Authorization',
    inputLabel: 'Apple Pay Contact Number or Name (Optional)',
    inputPlaceholder: 'e.g. Account holder name',
    instruction: 'The payment instructions will be sent to you after the order is received on how to pay.',
    requiresInput: false,
  },
];

export function formatPaymentMethod(method?: string): string {
  if (!method) return 'Not Specified';
  const found = PAYMENT_OPTIONS.find((opt) => opt.id === method);
  if (found) return found.name;
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
