'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFetchGenerationTopics } from '@/hooks/useFetchGenerationTopics';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/selectors';

import NewTopicButton from './NewTopicButton';
import TopicItem from './TopicItem';

const TopicsList = memo(() => {
  useFetchGenerationTopics();
  const [parent] = useAutoAnimate();
  const generationTopics = useImageStore(generationTopicSelectors.generationTopics);
  const openNewGenerationTopic = useImageStore((s) => s.openNewGenerationTopic);

  const isEmpty = !generationTopics || generationTopics.length === 0;
  if (isEmpty) {
    return null;
  }

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
      <NewTopicButton onClick={openNewGenerationTopic} />

      <Flexbox align="center" gap={6} ref={parent}>
        {generationTopics.map((topic) => (
          <div key={topic.id}>
            <TopicItem topic={topic} />
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

TopicsList.displayName = 'TopicsList';

export default TopicsList;
