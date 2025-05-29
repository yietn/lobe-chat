'use client';

import { ActionIcon, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    width: 50px;
    height: 50px;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorder};
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
}));

const AddButton = memo(() => {
  const { t } = useTranslation('image');
  const { styles } = useStyles();

  return (
    <Tooltip placement="left" title={t('topic.createNew')}>
      <ActionIcon
        className={styles.button}
        icon={Plus}
        // loading={isValidating}
        // onClick={() => mutate()}
        size={60}
      />
    </Tooltip>
  );
});

AddButton.displayName = 'AddButton';

export default AddButton;
