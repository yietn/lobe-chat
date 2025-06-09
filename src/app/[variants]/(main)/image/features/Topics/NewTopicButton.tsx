'use client';

import { Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    width: 50px;
    height: 50px;
    background: transparent;
    border: 1px solid ${token.colorBorder};
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;

    &:hover {
      transform: scale(1.05);
      background: ${token.colorFillSecondary};
    }

    &:active {
      transform: scale(0.98);
      background: ${token.colorFillTertiary};
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, ${token.colorPrimary}20 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border-radius: 6px;
    }

    &:active::before {
      opacity: 1;
    }
  `,
}));

const NewTopicButton = memo(({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('image');
  const { styles } = useStyles();

  return (
    <Tooltip placement="left" title={t('topic.createNew')}>
      <Center className={styles.button} onClick={onClick}>
        <Plus size={12} />
      </Center>
    </Tooltip>
  );
});

NewTopicButton.displayName = 'NewTopicButton';

export default NewTopicButton;
