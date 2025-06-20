'use client';

import dynamic from 'next/dynamic';
import { useQueryState } from 'nuqs';

import EmptyLayout from './EmptyLayout';
import SkeletonList from './SkeletonList';

const ImageWorkspaceContent = dynamic(() => import('./ImageWorkspaceContent'), {
  ssr: false,
  loading: () => <SkeletonList />,
});

const ImageWorkspace = () => {
  const [topic] = useQueryState('topic');

  // 如果没有 topic 参数，显示空状态布局
  if (!topic) {
    return <EmptyLayout />;
  }

  // 有 topic 参数时显示主要内容
  return <ImageWorkspaceContent />;
};

export default ImageWorkspace;
