import { Form, FormItemProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { aiImageGenerationConfigSelectors } from '@/store/aiImage/slices/generationConfig/selectors';
import { useAiImageStore } from '@/store/aiImage/store';

import ModelSelect from './ModelSelect';
import SeedNumberInput from './SeedNumberInput';
import SizeSliderInput from './SizeSliderInput';
import StepsSliderInput from './StepsSliderInput';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-y: auto;

    width: 260px;
    height: 100%;
    padding: 16px;
    border-inline-start: 1px solid ${token.colorBorderSecondary};
  `,
}));
const isSupportParamSelector = aiImageGenerationConfigSelectors.isSupportParam;

const ConfigPanel = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('aiImage');
  const isSupportWidth = useAiImageStore(isSupportParamSelector('width'));
  const isSupportHeight = useAiImageStore(isSupportParamSelector('height'));
  const isSupportSeed = useAiImageStore(isSupportParamSelector('seed'));
  const isSupportSteps = useAiImageStore(isSupportParamSelector('steps'));

  const configs = (
    [
      {
        label: t('config.model.label'),
        children: <ModelSelect />,
      },
      isSupportWidth && {
        label: t('config.width.label'),
        children: <SizeSliderInput paramName="width" />,
      },
      isSupportHeight && {
        label: t('config.height.label'),
        children: <SizeSliderInput paramName="height" />,
      },
      isSupportSteps && {
        label: t('config.steps.label'),
        children: <StepsSliderInput />,
      },
      isSupportSeed && {
        label: t('config.seed.label'),
        children: <SeedNumberInput />,
      },
    ] satisfies Array<Partial<FormItemProps> | boolean>
  )
    .filter(Boolean)
    .map((item) => ({ ...item, layout: 'vertical' as const }));

  return (
    <Flexbox className={styles.container} gap={16}>
      <Form
        items={[
          {
            children: configs,
            title: t('config.title'),
          },
        ]}
        itemsType={'group'}
        variant={'borderless'}
        {...FORM_STYLE}
      />
    </Flexbox>
  );
});

export default ConfigPanel;
