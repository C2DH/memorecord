# Stage 1: Download and build with Jekyll
FROM jekyll/jekyll:4.2.0 AS jekyll

# Install necessary tools and clean up cache
RUN apk update && apk add --no-cache --update \
    findutils \
    sed

WORKDIR /app

# Set the version as an argument
ARG GIT_COMMIT_SHA
ARG GIT_TAG
ARG GIT_BRANCH
ARG BUILD_DATE
ARG GIT_REMOTE

# Download tarball using tags
COPY Gemfile ./
COPY Gemfile.lock ./
COPY _config.yml ./
COPY LICENSE ./

COPY _data ./_data
COPY _includes ./_includes
COPY _layouts ./_layouts
COPY _sass ./_sass
COPY assets ./assets
COPY d3 ./d3
COPY pages ./pages
COPY scripts ./scripts

RUN chmod -R 777 /app
ENV JEKYLL_BUILD_REVISION=${GIT_COMMIT_SHA}
ENV PAGES_REPO_NWO=C2DH/memorecord
# Build with Jekyll
RUN jekyll build

# create a file named version.json
# containing all these args
# - GIT_COMMIT
# - GIT_TAG
# - GIT_BRANCH
# - BUILD_DATE
# - GIT_REMOTE
RUN echo "{ \
  \"gitCommitSha\": \"${GIT_COMMIT_SHA}\", \
  \"gitTag\": \"${GIT_TAG}\", \
  \"gitBranch\": \"${GIT_BRANCH}\", \
  \"buildDate\": \"${BUILD_DATE}\", \
  \"gitRemote\": \"${GIT_REMOTE}\" \
}" >> /app/_site/version.json

RUN cat /app/_site/version.json

RUN ls -la /app/_site

FROM busybox:latest

COPY --from=jekyll /app/_site /app

RUN ls -la /app