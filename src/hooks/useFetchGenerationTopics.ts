import { useAiImageStore } from '@/store/aiImage';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

export const useFetchGenerationTopics = () => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);
  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchGenerationTopics = useAiImageStore((s) => s.useFetchGenerationTopics);

  useFetchGenerationTopics(isDBInited, isLogin);
};
