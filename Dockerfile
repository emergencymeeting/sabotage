# This Dockerfile can be used for docker-based deployments to platforms.
# It uses three multi-stage builds: `installation`, `bundles`, and the main build.

# --------------------------------------------------------------------------------
# INSTALLATION IMAGE
# A temporary image that installs production-only dependencies
FROM node:lts-alpine as installation
ENV NODE_ENV production
WORKDIR /usr/src/sabotage
COPY package*.json ./

# Install the project's dependencies
RUN npm ci

# --------------------------------------------------------------------------------
# BUNDLE IMAGE
# A temporary image that installs dependencies and builds the production-ready server.
FROM node:lts-alpine as bundles
WORKDIR /usr/src/docs
# Install the files used to create the bundles
COPY package*.json ./
COPY tsconfig.json ./tsconfig.json
COPY src ./src
# Install the project's dependencies and build the bundles
RUN npm ci && npm run build

# --------------------------------------------------------------------------------
# MAIN IMAGE
FROM node:lts-alpine

# Let's make our home
WORKDIR /usr/src/sabotage

# Ensure our node user owns the directory we're using
RUN chown node:node /usr/src/docs -R

# This should be our normal running user
USER node

# Copy our dependencies
COPY --chown=node:node --from=installation /usr/src/docs/node_modules /usr/src/docs/node_modules
COPY --chown=node:node --from=bundles /usr/src/docs/dist /usr/src/docs/dist

# We should always be running in production mode
ENV NODE_ENV production
CMD ["node", "./dist/index.js"]
