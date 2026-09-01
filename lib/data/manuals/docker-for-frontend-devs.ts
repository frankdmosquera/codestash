import type { Manual } from "../types";

export const dockerForFrontendDevs: Manual = {
  slug: "docker-for-frontend-devs",
  title: "Docker for Frontend Devs",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  createdAt: "2026-08-24",
  sections: [
    // ============================================================
    // 1. WHY A FRONTEND DEV SHOULD CARE
    // ============================================================
    {
      id: "why-docker",
      number: "1",
      title: "Why a Frontend Dev Should Care",
      blocks: [
        {
          type: "p",
          text: "Docker packages your app and everything it needs to run (Node version, system libraries, env setup) into a single **image**. That image runs the same way on your laptop, your teammate's laptop, and the server — no more \"works on my machine.\"",
        },
        { type: "p", text: "**Where it actually helps day to day:**" },
        {
          type: "list",
          items: [
            "Spinning up a Postgres/Redis/etc. database locally without installing it on your machine",
            "Matching the exact Node version the deploy target uses",
            "Onboarding a new teammate with one command instead of a setup doc",
            "Reproducing a bug that only happens \"in prod\"",
            "Running the same container locally that CI runs, so CI failures aren't a surprise",
          ],
        },
        {
          type: "note",
          text: "You don't need Docker to build or deploy a Next.js app — Vercel and most PaaS targets handle that for you. Reach for it when you need a consistent local environment, a self-hosted deploy, or services (databases, queues) running alongside your app.",
        },
      ],
    },

    // ============================================================
    // 2. CORE CONCEPTS
    // ============================================================
    {
      id: "core-concepts",
      number: "2",
      title: "Core Concepts",
      children: [
        // 2.1 Image vs Container
        {
          id: "image-vs-container",
          number: "2.1",
          title: "Image vs Container",
          blocks: [
            {
              type: "p",
              text: "An **image** is a read-only snapshot — your app's code, dependencies, and runtime, built from a `Dockerfile`. A **container** is a running instance of that image. One image, many containers.",
            },
          ],
        },
        // 2.2 Dockerfile
        {
          id: "dockerfile-concept",
          number: "2.2",
          title: "Dockerfile",
          blocks: [
            {
              type: "p",
              text: "A text file with step-by-step instructions for building an image: which base image to start from, what to copy in, what commands to run, and what to execute when the container starts.",
            },
          ],
        },
        // 2.3 Registry
        {
          id: "registry-concept",
          number: "2.3",
          title: "Registry",
          blocks: [
            {
              type: "p",
              text: "Where built images are stored and pulled from — Docker Hub, GitHub Container Registry (`ghcr.io`), or a cloud provider's registry. `docker push`/`docker pull` move images to and from a registry.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 3. INSTALL & FIRST COMMANDS
    // ============================================================
    {
      id: "install",
      number: "3",
      title: "Install & First Commands",
      blocks: [
        {
          type: "p",
          text: "Install Docker Desktop (Mac/Windows) or Docker Engine (Linux). Verify it's working:",
        },
        { type: "code", code: "docker --version\ndocker run hello-world" },
        {
          type: "p",
          text: "A few commands you'll use constantly:",
        },
        {
          type: "code",
          code: `docker ps                 # list running containers
docker ps -a               # list all containers, including stopped ones
docker images               # list images on this machine
docker logs <container>     # view stdout/stderr from a container
docker exec -it <container> sh   # open a shell inside a running container
docker stop <container>     # stop a running container
docker rm <container>       # remove a stopped container
docker rmi <image>          # remove an image`,
        },
      ],
    },

    // ============================================================
    // 4. A DOCKERFILE FOR A NEXT.JS APP
    // ============================================================
    {
      id: "dockerfile-nextjs",
      number: "4",
      title: "A Dockerfile for a Next.js App",
      children: [
        // 4.1 A minimal single-stage Dockerfile
        {
          id: "minimal-dockerfile",
          number: "4.1",
          title: "A minimal single-stage Dockerfile",
          blocks: [
            {
              type: "p",
              text: "Enough to get a Next.js app running in a container. Not optimized yet — see the multi-stage version below for that.",
            },
            {
              type: "code",
              code: `# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]`,
            },
            {
              type: "p",
              text: "Build and run it:",
            },
            {
              type: "code",
              code: `docker build -t my-next-app .
docker run -p 3000:3000 my-next-app`,
            },
          ],
        },
        // 4.2 Reading it line by line
        {
          id: "dockerfile-line-by-line",
          number: "4.2",
          title: "Reading it line by line",
          blocks: [
            {
              type: "list",
              items: [
                "`FROM node:20-alpine` — start from a small Linux image with Node 20 already installed",
                "`WORKDIR /app` — every command after this runs inside `/app` in the container",
                "`COPY package.json package-lock.json ./` then `RUN npm ci` — install deps in their own layer, before copying the rest of the source",
                "`COPY . .` — copy the rest of the project in",
                "`RUN npm run build` — produce the production build",
                "`EXPOSE 3000` — documents which port the app listens on (doesn't actually publish it — that's `-p` at run time)",
                "`CMD [\"npm\", \"start\"]` — what runs when the container starts",
              ],
            },
            {
              type: "note",
              text: "Copying `package.json`/`package-lock.json` and running `npm ci` **before** copying the rest of the source is deliberate. Docker caches each layer — if your source changes but your dependencies don't, this ordering means `npm ci` is skipped on rebuild instead of reinstalling everything.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 5. .DOCKERIGNORE
    // ============================================================
    {
      id: "dockerignore",
      number: "5",
      title: ".dockerignore",
      blocks: [
        {
          type: "p",
          text: "Without one, `COPY . .` sends your entire project directory — including `node_modules`, `.git`, and `.next` — into the build context. That's slow, bloats the image, and can pull in a `node_modules` built for the wrong OS/architecture.",
        },
        {
          type: "code",
          code: `node_modules
.next
.git
.env*
npm-debug.log
Dockerfile
.dockerignore
README.md`,
        },
        {
          type: "note",
          text: "This is the single most common Docker mistake for frontend devs: forgetting `.dockerignore` and shipping a local `node_modules` (with native bindings built for macOS) into a Linux container, where it silently breaks.",
        },
      ],
    },

    // ============================================================
    // 6. MULTI-STAGE BUILDS
    // ============================================================
    {
      id: "multi-stage",
      number: "6",
      title: "Multi-Stage Builds",
      blocks: [
        {
          type: "p",
          text: "A single-stage build keeps every build tool, dev dependency, and intermediate file in the final image — needlessly large. A **multi-stage build** uses several `FROM` blocks in one Dockerfile: earlier stages install deps and build, the final stage copies over only the compiled output. Next.js's `output: \"standalone\"` mode is built for exactly this.",
        },
        {
          type: "p",
          text: "First, enable standalone output in `next.config.js`:",
        },
        { type: "code", code: "module.exports = {\n  output: \"standalone\",\n};" },
        {
          type: "p",
          text: "Then a leaner, multi-stage Dockerfile:",
        },
        {
          type: "code",
          code: `# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]`,
        },
        {
          type: "p",
          text: "The `runner` stage never installs `npm` packages or dev tooling — it only contains the standalone server bundle Next.js already resolved, which typically cuts the final image from 1GB+ down to well under 200MB.",
        },
      ],
    },

    // ============================================================
    // 7. DOCKER COMPOSE FOR LOCAL DEV
    // ============================================================
    {
      id: "compose",
      number: "7",
      title: "docker-compose for Local Dev",
      children: [
        // 7.1 Why compose
        {
          id: "why-compose",
          number: "7.1",
          title: "Why compose",
          blocks: [
            {
              type: "p",
              text: "Real apps rarely run in isolation — you usually need a database, maybe a cache, alongside the app itself. `docker-compose` lets you describe all of those services in one YAML file and bring them up together with a single command, instead of running several `docker run` commands by hand.",
            },
          ],
        },
        // 7.2 A compose.yml for app + Postgres + Redis
        {
          id: "compose-example",
          number: "7.2",
          title: "A compose.yml for app + Postgres + Redis",
          blocks: [
            {
              type: "code",
              code: `# compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  db-data:`,
            },
            {
              type: "p",
              text: "Bring everything up, tail logs, and tear it down:",
            },
            {
              type: "code",
              code: `docker compose up          # start all services in the foreground
docker compose up -d       # start in the background (detached)
docker compose logs -f app # follow logs for just the app service
docker compose down        # stop and remove containers
docker compose down -v     # also remove named volumes (deletes DB data)`,
            },
            {
              type: "note",
              text: "Inside the compose network, services reach each other by service name — `db` and `cache` above, not `localhost`. `DATABASE_URL` points at `db:5432` because that's the hostname Docker's internal DNS resolves for the `db` service.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 8. VOLUMES & BIND MOUNTS FOR HOT RELOAD
    // ============================================================
    {
      id: "volumes",
      number: "8",
      title: "Volumes & Bind Mounts for Hot Reload",
      children: [
        // 8.1 The problem
        {
          id: "hot-reload-problem",
          number: "8.1",
          title: "The problem",
          blocks: [
            {
              type: "p",
              text: "The Dockerfiles above `COPY` your source in at build time — edit a file locally and nothing changes inside the running container. For local dev you want the opposite: the container should see your live source files.",
            },
          ],
        },
        // 8.2 Bind-mounting source for next dev
        {
          id: "bind-mount-dev",
          number: "8.2",
          title: "Bind-mounting source for next dev",
          blocks: [
            {
              type: "p",
              text: "A **bind mount** maps a folder on your host machine directly into the container, so file changes on either side are reflected on both. Add a dev-specific service (or override) that runs `next dev` and mounts your source:",
            },
            {
              type: "code",
              code: `# compose.dev.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: npm run dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - WATCHPACK_POLLING=true`,
            },
            {
              type: "list",
              items: [
                "`.:/app` — bind-mount the whole project into the container so edits show up instantly",
                "`/app/node_modules` — an **anonymous volume** that shadows the mount above just for `node_modules`, so the container keeps its own Linux-built dependencies instead of your host's",
                "`/app/.next` — same idea, keeps the build cache inside the container",
                "`WATCHPACK_POLLING=true` — bind mounts don't always deliver native filesystem change events (especially on Docker Desktop for Mac/Windows), so this makes Next.js poll for changes instead",
              ],
            },
          ],
        },
      ],
    },

    // ============================================================
    // 9. COMMON GOTCHAS
    // ============================================================
    {
      id: "gotchas",
      number: "9",
      title: "Common Gotchas",
      blocks: [
        {
          type: "list",
          items: [
            "**Port mapping direction** — `-p 3000:3000` is `host:container`. If nothing loads at `localhost:3000`, check the *second* number matches what your app actually listens on inside the container.",
            "**`node_modules` baked in from your host** — copying a host `node_modules` into a Linux container can ship the wrong native binaries. Always exclude it via `.dockerignore` and let `npm ci` install fresh inside the image.",
            "**`localhost` inside a container means the container**, not your host machine or other containers. Use the service name (compose) or `host.docker.internal` (to reach the host machine from inside a container) instead.",
            "**Cache invalidation from copying too early** — if `COPY . .` comes before `RUN npm ci`, every source change busts the dependency-install cache layer and rebuilds are slow.",
            "**Forgetting `EXPOSE` doesn't publish a port** — it's documentation only; you still need `-p` (or `ports:` in compose) to actually reach it from the host.",
            "**Stale images after a Dockerfile change** — if a build doesn't seem to pick up your edit, try `docker build --no-cache` or prune old images with `docker system prune`.",
          ],
        },
      ],
    },

    // ============================================================
    // 10. IMAGE SIZE CHECKLIST
    // ============================================================
    {
      id: "size-checklist",
      number: "10",
      title: "Image Size Checklist",
      blocks: [
        {
          type: "list",
          items: [
            "Use an `-alpine` or `-slim` base image instead of the full `node` image",
            "Use `output: \"standalone\"` in `next.config.js` and a multi-stage build",
            "Write a `.dockerignore` that excludes `node_modules`, `.git`, `.next`, and env files",
            "Run `npm ci` instead of `npm install` — faster, and fails loudly if the lockfile is out of sync",
            "Don't install dev dependencies in the final stage (`npm ci --omit=dev` in the runner stage if you're not using standalone output)",
            "Check the result with `docker images` — compare sizes before and after",
          ],
        },
        { type: "code", code: "docker images my-next-app" },
      ],
    },
  ],
};
