import { useQueryState } from 'nuqs';
import { useLayoutEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useImageStore } from '@/store/image';

/**
 * 双向绑定 url 的 topic 参数到 image store 的 activeGenerationTopicId
 */
export function useTopicFromSearchParams() {
  const useStoreUpdater = createStoreUpdater(useImageStore);

  const [topic, setTopic] = useQueryState('topic', { history: 'replace', throttleMs: 500 });
  useStoreUpdater('activeGenerationTopicId', topic);

  useLayoutEffect(() => {
    const unsubscribeTopic = useImageStore.subscribe(
      (s) => s.activeGenerationTopicId,
      (state) => {
        setTopic(!state ? null : state);
      },
    );

    return () => {
      unsubscribeTopic();
    };
  }, []);
}
