import React, { Suspense, lazy } from 'react';

import SkeletonList from './SkeletonList';

const GenerationBatchList = lazy(() => import('./GenerationBatchList'));

const GenerationFeed = () => {
  return (
    <Suspense fallback={<SkeletonList />}>
      <GenerationBatchList />
    </Suspense>
  );
};

GenerationFeed.displayName = 'GenerationFeed';

export default GenerationFeed;
