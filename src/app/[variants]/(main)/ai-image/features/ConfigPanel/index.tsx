import { Form } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';

import ModelSelect from './ModelSelect';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    height: 100%;
    width: 260px;
    overflow-y: auto;
    padding: 16px;
    border-left: 1px solid ${token.colorBorderSecondary};
  `,
}));

const wrapperCol = {
  style: {
    maxWidth: '100%',
    width: '100%',
  },
};

const ConfigPanel = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('aiImage');

  return (
    <Flexbox className={styles.container} gap={16}>
      <Form
        items={[
          {
            children: [
              {
                children: <ModelSelect />,
                label: t('config.models', 'Models'),
                layout: 'vertical',
                wrapperCol,
              },
            ],
          },
        ]}
        variant={'borderless'}
        {...FORM_STYLE}
      />
    </Flexbox>
  );
});

export default ConfigPanel;
