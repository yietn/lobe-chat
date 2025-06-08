'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFetchGenerationTopics } from '@/hooks/useFetchGenerationTopics';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/selectors';

import AddButton from './NewTopicButton';
import TopicItem from './TopicItem';

const TopicsList = memo(() => {
  useFetchGenerationTopics();
  const [parent] = useAutoAnimate();
  const generationTopics = useImageStore(generationTopicSelectors.generationTopics);
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
      <AddButton />

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
