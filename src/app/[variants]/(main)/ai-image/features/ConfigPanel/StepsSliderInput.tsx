import { SliderWithInput } from '@lobehub/ui';
import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/aiImage/slices/generationConfig/hooks';

const SizeSliderInput = memo(() => {
  const { value, setValue, min, max } = useGenerationConfigParam('steps');
  return <SliderWithInput max={max} min={min} onChange={setValue} value={value} />;
});

export default SizeSliderInput;
