import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
    (await sentryOnBuildEnd({ viteConfig, reactRouterConfig, buildManifest }));
  },
  ssr: true,
} satisfies Config;
