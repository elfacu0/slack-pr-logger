# Description
This project automatically detects pull requests in a specified repository and notifies a designated Slack channel to expedite the review process. 
At the end of each day, it also generates a summary report in a Google Sheet for easy tracking and analysis.

# Core Functionalities
## GitHub → API (Webhook handler)

- Trigger: GitHub sends a webhook on pull request events (opened, closed, merged).
- Verify the payload signature with a shared secret.
- Parse info: PR title, author, repo, created_at, merged_at, state.
- Publish to datapipe-pr-events Pub/Sub topic for async processing.

## Worker (Pub/Sub subscriber)

- Receives the event message (new-pr).
- Formats a Slack message using Block Kit:
- e.g. 🟢 New PR: *Fix login bug* by @jhonlocke in org/repo → <link>
- Posts to Slack using Incoming Webhook URL or Slack App Bot Token.
- Logs the event into Firestore:

## Daily Report Generator

- Trigger: Cloud Scheduler publishes a "daily-report" message every day at 23:59 UTC.
- Worker receives the event:
- Queries Firestore for all PRs created/merged in the last 24h.
- Aggregates:
    - Total PRs opened
    - Total merged
    - Total closed
- Posts a summary message to Slack:
    📊 Daily Report: 7 PRs opened, 5 merged, 2 closed


# Core Architecture
```
┌──────────────────────────────────────┐
│ GitHub Repo                          │
│   → Webhook (on pull_request events) │
└──────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────┐
│ Cloud Run service (DataPipe API, in Hono)     │
│  - Receives GitHub webhook                    │
│  - Verifies signature (HMAC)                  │
│  - Logs PR event                              │
│  - Publishes a message to Pub/Sub ("new-pr")  │
└───────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────┐
│ Pub/Sub topic: datapipe-pr-events             │
│  - Worker subscribes and posts to Slack       │
│  - Also stores minimal data in Firestore      │
└───────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────┐
│ Cloud Scheduler (runs daily)                  │
│  → Publishes a "daily-report" job to Pub/Sub  │
│  → Worker fetches stored PRs and writes them  │
│    into Google Sheets                         │
└───────────────────────────────────────────────┘
```
# Tech Stack
- Node 22
- TypeScript
- Hono
- Cloud Run (Containers)
- Google Firestore
- Google Pub/Sub
- Google Cloud Scheduler
- Supertest
- Vitest
- Zod

# Integrations
- GitHub Webhooks
- Slack
- Google Sheets API
- Google Secret Manager



# Github SetUp
1. Go to Setting -> Webhooks
2. Add your url + /webhook/github
3. Select Pull Request event
4. Add secret matching the .env secret
5. Submit