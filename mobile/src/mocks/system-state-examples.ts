import type { EmptyStateProps, ErrorStateProps, SkeletonLoaderType } from '../components/ui';
import examples from '../content/dev-examples.json';
import systemContent from '../content/system.json';

export const emptyStateExamples = systemContent.emptyStates as (
  EmptyStateProps & { type: NonNullable<EmptyStateProps['type']> }
)[];

export const errorStateExample = systemContent.errorState as ErrorStateProps;

export const skeletonLoaderTypes = examples.system.skeletonLoaderTypes as SkeletonLoaderType[];
