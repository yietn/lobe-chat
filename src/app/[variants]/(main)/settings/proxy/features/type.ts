type ProxyType = 'http' | 'https' | 'socks5';

interface ProxySettings {
  enableProxy: boolean;
  proxyType: ProxyType;
  proxyServer: string;
  proxyPort: string;
  proxyRequireAuth: boolean;
  proxyUsername?: string;
  proxyPassword?: string;
  proxyBypass?: string;
}
