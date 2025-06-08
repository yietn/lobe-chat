import React, { Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from './SkeletonList';

const TopicsList = lazy(() => import('./TopicList'));

const Topics = async () => {
  return (
    <Flexbox
      align="center"
      style={{
        width: 80,
        height: '100%',
        paddingTop: 30,
        overflowY: 'auto',
      }}
    >
      <Suspense fallback={<SkeletonList />}>
        <TopicsList />
      </Suspense>
    </Flexbox>
  );
};

Topics.displayName = 'Topics';

export default Topics;
