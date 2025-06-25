/**
 * 判断URL是否为本地地址
 * @param url - 要检查的URL
 * @returns 如果是本地地址则返回true，否则返回false
 */
export const isLocalUrl = (url: string): boolean => {
  if (!url) return false;

  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('::1') || // IPv6 localhost
    url.includes('0.0.0.0') // 本地所有接口
  );
};
