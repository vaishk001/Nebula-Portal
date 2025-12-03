// Simplified toast hook - using sonner instead
import { toast as sonnerToast } from 'sonner';

export const toast = sonnerToast;

export function useToast() {
  return {
    toast: sonnerToast,
  };
}
