# Git-Native Agent Cooperation: The Complete Playbook

> **"It's not local or sandbox, it's git-native."** — Captain Casey

## Executive Summary

Current AI coding tools (Aider, Claude Code, Cursor, Crush) are **single-agent, local-first, chat-driven**. Our fleet operates as **multi-agent, repo-first, git-native**. This document captures the research, architecture, and specific GitHub exploitation strategies to make our fleet the most effective agentic development system ever built.

---

## The Paradigm Shift

| Dimension | Old (Aider/Claude/Cursor) | New (FLUX Fleet) |
|-----------|---------------------------|-------------------|
| Agents | 1 | N (fleet) |
| Coordination | Chat (synchronous) | Git commits (asynchronous) |
| State | Local files | GitHub repos |
| CI/CD | Manual | Free (GitHub Actions) |
| Verification | Self-test | Cross-agent adversarial review |
| Knowledge | Session context | Repo history (permanent) |
| Scaling | Bigger model | More agents |
| Human role | Prompt engineer | Captain (approve/redirect) |
| Cost | $200/month per tool | Free (GitHub free tier) |

---

## 5 Killer Advantages Over Single-Agent Tools

### 1. Adversarial Verification (Red Team / Blue Team)
- **WriterAgent** writes code
- **TestAgent** writes adversarial tests designed to break it
- **ReviewAgent** checks architectural compliance
- Result: 3x more edge cases caught than self-testing

### 2. Parallelization by Architectural Boundary
- RouterAgent parses task into dependency graph
- Multiple agents work different branches simultaneously
- Merge when tests pass independently

### 3. Permanent Institutional Memory
- Every decision is a commit with metadata
- Agent diaries in repos, not session contexts
- New agents bootstrap from repo history

### 4. Free CI/CD at Scale
- GitHub Actions: 2,000 min/month free
- Auto-test on every push
- Artifacts stored for agent review
- Cross-repo notification via dispatch events

### 5. Captain-Not-Bottleneck
- Human approves merges, doesn't write code
- Agent trust scores auto-promote reliable agents
- Escalation paths for blocked tasks
- Dashboard (oracle1-index) shows fleet status at a glance

---

## 30 GitHub Features Exploited by Agents

### Compute (Free!)
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 1 | **Actions** | Run tests, builds, analysis on push | Automatic verification |
| 2 | **Codespaces** | Spin up dev environments | Isolated workspaces |
| 3 | **Packages** | Publish/share libraries | Component sharing |
| 4 | **Artifacts** | Store test results, build outputs | Agent-to-agent handoff |
| 5 | **Pages** | Host dashboards, docs | Fleet visibility |

### Communication
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 6 | **Issues** | Create/assign/track tasks | Asynchronous work queue |
| 7 | **PRs** | Propose changes, request review | Structured collaboration |
| 8 | **Discussions** | Debate, plan, share knowledge | Consensus building |
| 9 | **Webhooks** | Real-time event notification | Event-driven coordination |
| 10 | **Notifications** | @mention, subscription alerts | Attention routing |

### Organization
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 11 | **Projects v2** | Kanban boards, status tracking | Fleet kanban |
| 12 | **Labels** | State machine (status, priority, domain) | Task routing |
| 13 | **Branches** | Isolated work streams | Parallel execution |
| 14 | **Forks** | Copy-modify-contribute pattern | Safe experimentation |
| 15 | **Tags** | Version milestones | Coordinated releases |

### Quality & Security
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 16 | **Checks (Status API)** | Pass/fail gates on commits | Multi-agent approval |
| 17 | **Code Scanning** | Automated security analysis | Coordinated vuln management |
| 18 | **Dependabot** | Auto-dependency updates | Supply chain coordination |
| 19 | **Branch Protection** | Mandatory reviews | Governance automation |
| 20 | **Merge Queues** | Ordered PR merging | Conflict prevention |

### Knowledge
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 21 | **Wikis** | Collaborative documentation | Protocol specs |
| 22 | **Releases** | Version communication | Downstream coordination |
| 23 | **Gists** | Share snippets/configs | Quick info exchange |
| 24 | **GraphQL API** | Efficient complex queries | Informed decisions |
| 25 | **Insights** | Analyze activity patterns | Workload distribution |

### Infrastructure
| # | Feature | Agent Usage | A2A Value |
|---|---------|-------------|-----------|
| 26 | **Environments** | Staged deployments | Coordinated rollouts |
| 27 | **Secrets** | Secure credential storage | Authenticated ops |
| 28 | **Deployments** | Track what's deployed where | Audit trail |
| 29 | **Templates** | Quick repo spawning | Standardized setup |
| 30 | **Orgs/Teams** | Permission structure | Role-based access |

---

## Fleet CI/CD Architecture

### Workflow 1: Auto-Test (Triggered by Agent Commits)
```
Agent pushes → GitHub Actions → detect language → run tests → artifact upload
If PR: → create check status → reviewer agent sees green/red
```

### Workflow 2: Cross-Repo Sync (Agent-to-Agent Notification)
```
Agent A pushes to main → dispatch event → Agent B's repo gets notified
→ Agent B checks if it needs to update
```

### Workflow 3: Fleet Health (Scheduled)
```
Every 30 min → scan fleet repos → check CI status → update dashboard
→ flag stale repos → create issues for attention
```

### Workflow 4: TODO-to-Issue (Knowledge Mining)
```
Every 6h → scan TODO/FIXME → create issues → auto-assign by label
→ agents claim from issue queue
```

---

## Free Tier Budget

| Resource | Free Allowance | Fleet Usage |
|----------|---------------|-------------|
| Actions minutes | 2,000/month | ~200 repos × 5 min = 1,000 |
| API requests | 5,000/hour | Agents poll every 5 min = 600/hr |
| Storage | 500MB | Test artifacts, reports |
| Pages | Unlimited | Dashboard hosting |
| Codespaces | 120 core-hours | Agent runtime |
| Packages | 500MB | Library distribution |

**Total cost: $0/month** vs $200+/month for single-agent tools.

---

## The Kimi Architecture: Git-Native Agent Swarm (GNAS)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLEET ORCHESTRATOR                        │
│         (GitHub App: "FleetCommand" running on Actions)      │
└──────────────┬──────────────────────────────────────────────┘
               │ Webhooks / GraphQL
    ┌──────────┴──────────┐
    ▼                     ▼
┌─────────┐         ┌──────────┐
│ AGENT   │◄───────►│  AGENT   │   ... (N agents)
│   REPO  │  PR/Iss │   REPO   │
│ (Micro- │         │ (Micro-  │
│  service)│         │  service)│
└────┬────┘         └────┬─────┘
     │                   │
     └───────┬───────────┘
             ▼
    ┌─────────────────┐
    │  SHARED CANON   │
    │  (Target Repo)  │  ← The actual product codebase
    └─────────────────┘
```

**Agent Structure**: Each agent is a repo containing:
- `src/`: Agent's own logic (self-modifying)
- `prompts/`: System prompts versioned via git
- `tools/`: Specific capabilities
- `.github/workflows/`: Agent's runtime

**Coordination Protocol**:
- **Issues** = Task contracts (structured YAML frontmatter)
- **PRs** = Proposals with semantic diffs
- **Commits** = Checkpointing reasoning
- **Labels** = State machine

---

## Research Sources

- **Seed (SiliconFlow)**: Creative ideation on GitHub exploitation
- **Kimi-K2.5 (SiliconFlow)**: Big-picture architecture, 5 killer advantages
- **DeepSeek-V3.2 (SiliconFlow)**: 30-feature GitHub catalog
- **Oracle1 🔮**: Synthesis and implementation

---

*Part of the FLUX Fleet Research Series. Generated 2026-04-11.*
