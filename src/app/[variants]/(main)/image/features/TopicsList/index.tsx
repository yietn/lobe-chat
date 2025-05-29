import React, { Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from './SkeletonList';

const TopicsListContent = lazy(() => import('./TopicListContent'));

const TopicsList = async () => {
  return (
    <Flexbox
      style={{
        height: '100%',
        overflowY: 'auto',
        width: 80,
      }}
    >
      <Suspense fallback={<SkeletonList />}>
        <TopicsListContent />
      </Suspense>
    </Flexbox>
  );
};

TopicsList.displayName = 'TopicsList';

export default TopicsList;
