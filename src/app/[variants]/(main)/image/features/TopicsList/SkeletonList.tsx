import { Divider, Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AddButton from './AddButton';

const SkeletonList = memo(() => {
  return (
    <Flexbox
      align="center"
      gap={8}
      padding={12}
      style={{
        height: '100%',
        overflowY: 'auto',
        width: 60,
      }}
    >
      {/* 直接复用 AddButton 的 loading 状态 */}
      <AddButton />

      <Flexbox align="center" gap={6}>
        {/* Topic items skeleton */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index}>
            <Skeleton.Avatar
              size={50}
              style={{
                borderRadius: 6,
              }}
            />
            {index < 4 && <Divider style={{ margin: '6px 0', width: 50 }} />}
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

SkeletonList.displayName = 'SkeletonList';

export default SkeletonList;
