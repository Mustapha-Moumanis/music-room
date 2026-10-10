import type { EmptyStateProps, ErrorStateProps, SkeletonLoaderType } from '../components/ui';

export const emptyStateExamples: Array<EmptyStateProps & { type: NonNullable<EmptyStateProps['type']> }> = [
  {
    actionLabel: 'Explore',
    description: 'Your music will appear here when there is something to show.',
    title: 'Nothing here yet',
    type: 'default',
  },
  {
    actionLabel: 'Clear search',
    description: 'Try another search or clear filters.',
    title: 'No matches yet',
    type: 'noResults',
  },
];

export const errorStateExample: ErrorStateProps = {
  actionLabel: 'Retry',
  description: 'Try again or check your connection.',
  title: 'Something went wrong',
};

export const skeletonLoaderTypes: SkeletonLoaderType[] = ['card', 'row'];
