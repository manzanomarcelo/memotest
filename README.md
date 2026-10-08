```markdown
# Memotest Pi Server Homelab

A Raspberry Pi 4 homelab used to practice Linux administration, Docker, networking,
GitHub Actions, automation, Azure and Terraform through a real deployed application.

Memotest is the workload running on the server.

---

## Overview

This project is focused on learning how a small Linux server is:

- configured
- secured
- containerized
- operated remotely
- automated
- monitored
- connected to cloud infrastructure

The goal is not only to run an application, but to understand how the infrastructure
works and how to troubleshoot it.

---

## Architecture

```text
                    Local Network
                         │
                         │ HTTP :80
                         ▼
                ┌─────────────────┐
                │ Raspberry Pi 4  │
                │ Debian 13 ARM64 │
                └────────┬────────┘
                         │
                         │ Docker Compose
                         ▼
                ┌─────────────────┐
                │ Memotest        │
                │ Nginx Container │
                └────────┬────────┘
                         │
                         ▼
                HTML / CSS / JavaScript
```

---

## Technology Stack

| Area | Technology |
|---|---|
| Server | Raspberry Pi 4 Model B |
| Operating system | Raspberry Pi OS Lite / Debian 13 |
| Architecture | ARM64 / `aarch64` |
| Containers | Docker |
| Orchestration | Docker Compose |
| Web server | Nginx |
| Source control | Git / GitHub |
| CI/CD | GitHub Actions |
| Automation | Bash / systemd |
| Cloud | Microsoft Azure |
| Infrastructure as Code | Terraform |

---

## Hardware

| Component | Configuration |
|---|---|
| Raspberry Pi | Raspberry Pi 4 Model B |
| RAM | 2 GB |
| OS storage | 16 GB microSD |
| Data storage | 500 GB SATA HDD via USB 3.0 |
| Network | Ethernet |

The external HDD is mounted at:

```text
/srv
```

Docker and application data are kept on the HDD instead of the microSD.

---

## Application

Memotest is a browser-based memory game built with:

- HTML
- CSS
- JavaScript

Main application files:

```text
index.html
style.css
script.js
images/
audio/
```

---

## Container Deployment

The application runs inside an Nginx container managed by Docker Compose.

Current deployment:

| Setting | Value |
|---|---|
| Service | `memotest` |
| Image | `memotest:1.0` |
| Host port | `80` |
| Container port | `80` |
| Restart policy | `unless-stopped` |

Deployment flow:

```text
Source code
    │
    ▼
Docker build
    │
    ▼
Nginx image
    │
    ▼
Docker Compose
    │
    ▼
Memotest on port 80
```

---

## Networking

The Raspberry Pi is connected to the LAN through Ethernet.

| Service | Address / Port |
|---|---|
| Raspberry Pi | `192.168.50.172` |
| SSH | TCP `22` |
| Memotest | TCP `80` |
| Hostname | `pi-server.local` |

The IP address is maintained through a DHCP reservation on the router.

There is currently no public Internet exposure or router port forwarding.

---

## Storage Layout

```text
/srv
├── apps
│   └── memotest
├── docker
├── containerd
├── backups
└── logs
```

Important paths:

| Purpose | Path |
|---|---|
| Repository | `/srv/apps/memotest` |
| Docker data | `/srv/docker` |
| containerd data | `/srv/containerd` |
| Backups | `/srv/backups` |
| Logs | `/srv/logs` |

---

## Security

Current security measures include:

- SSH key authentication
- SSH password authentication disabled
- root SSH login disabled
- no public port forwarding
- secrets excluded from Git
- environment files excluded through `.gitignore`
- runtime data stored outside the Git repository

---

## Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── readme-check.yml
├── audio/
├── images/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── compose.yaml
├── index.html
├── script.js
├── style.css
└── README.md
```

---

## GitHub Actions

The repository currently contains a basic GitHub Actions workflow that runs on:

- pushes to `main`
- pull requests

Current checks:

- verifies that `README.md` exists
- detects trailing spaces
- checks for lines longer than 120 characters

Automated deployment to the Raspberry Pi will be added in a later phase.

---

## Project Progress

### Completed

- [x] Raspberry Pi OS installation
- [x] Linux base configuration
- [x] External HDD setup
- [x] Persistent `/srv` mount
- [x] SSH key authentication
- [x] SSH hardening
- [x] Nginx application deployment
- [x] Docker installation
- [x] Docker storage moved to external HDD
- [x] containerd storage moved to external HDD
- [x] Memotest containerization
- [x] Docker Compose deployment
- [x] Git repository cleanup
- [x] Basic GitHub Actions validation

### Planned

- [ ] GitHub Actions CI/CD
- [ ] Automated deployment to the Raspberry Pi
- [ ] Bash automation
- [ ] systemd automation
- [ ] Azure integration
- [ ] Terraform infrastructure
- [ ] Monitoring and observability
- [ ] Additional security improvements

---

## Project Purpose

This homelab is part of my practical preparation for roles involving:

- IT Operations
- Linux administration
- Cloud Support
- Infrastructure
- Junior Platform / DevOps
```