import { z } from 'zod';

const ConfigSchema = z.object({
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/i, 'subdomain must be alphanumeric with hyphens only'),
  messageBoxId: z.coerce.number().int().positive(),
  accessToken: z.string().min(1),
  baseUrl: z.string().url().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse({
    subdomain: env.RELATION_SUBDOMAIN,
    messageBoxId: env.RELATION_MESSAGE_BOX_ID,
    accessToken: env.RELATION_ACCESS_TOKEN,
    baseUrl: env.RELATION_BASE_URL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `relation-mcp: invalid configuration. Set the required environment variables (see .env.example):\n${issues}`,
    );
  }
  return parsed.data;
}

export function resolveBaseUrl(config: Config): string {
  return config.baseUrl ?? `https://${config.subdomain}.relationapp.jp`;
}
