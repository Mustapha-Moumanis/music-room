import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: process.env.NODE_ENV === 'test' ? Infinity : undefined } } });
