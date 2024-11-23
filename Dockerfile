FROM oven/bun:1 AS base

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

FROM base AS prerelease
COPY . .
RUN bun install --frozen-lockfile

# [optional] tests & build
ENV NODE_ENV=production
#RUN bun test
RUN bun run build

WORKDIR /usr/src/app/server
RUN bun install --frozen-lockfile

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=prerelease /usr/src/app/ .

# run the app
USER bun
EXPOSE 9999
ENV RAVEN_DSN "NOT_SET"
WORKDIR /usr/src/app/server
ENTRYPOINT [ "bun", "run", "server.ts" ]
