import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Not required for `prisma generate` (e.g. during the Docker build), only for commands that connect to the database.
    url: process.env.DATABASE_URL ?? '',
  },
});
