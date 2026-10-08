```markdown
# Memotest Pi Server Homelab

A Raspberry Pi 4 homelab project focused on practical Linux, Docker, networking, Git, CI/CD, automation and cloud infrastructure skills.

The Memotest web application is used as the workload deployed and managed on the server.

## Project Goals

The objective of this project is to practice how a small Linux server is configured, operated, secured, automated and troubleshot.

The project focuses on:

- Linux server administration
- Docker and Docker Compose
- Git and GitHub
- GitHub Actions
- Networking and SSH
- Storage management
- Bash and systemd
- Azure
- Terraform
- Troubleshooting
- Monitoring and observability

## Current Architecture

```text
LAN client
    |
    | HTTP :80
    v
Raspberry Pi 4
    |
    | Docker port mapping 80:80
    v
Memotest container
    |
    v
Nginx
    |
    v
HTML / CSS / JavaScript application
```

## Hardware and Operating System

- Raspberry Pi 4 Model B
- 2 GB RAM
- 16 GB microSD for the operating system
- 500 GB external SATA HDD connected through USB 3.0
- Raspberry Pi OS Lite 64-bit
- Debian GNU/Linux 13
- ARM64 / `aarch64`

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

## Containerization

The application runs inside an Nginx Docker container.

Docker Compose is used to build and manage the service.

Current Compose configuration:

- Service: `memotest`
- Image: `memotest:1.0`
- Host port: `80`
- Container port: `80`
- Restart policy: `unless-stopped`

The image is built from the repository using the included `Dockerfile`.

## Storage

The external HDD is mounted at:

```text
/srv
```

Important server directories:

```text
/srv/apps
/srv/docker
/srv/containerd
/srv/backups
/srv/logs
```

Docker stores its data under:

```text
/srv/docker
```

containerd stores its data under:

```text
/srv/containerd
```

The repository is currently located on the Pi at:

```text
/srv/apps/memotest
```

## Networking

The Raspberry Pi is connected through Ethernet.

Current LAN address:

```text
192.168.50.172
```

Available services:

```text
SSH: TCP 22
Memotest: TCP 80
```

The Pi uses a DHCP reservation on the router.

There is currently no public Internet exposure or router port forwarding.

## Security

Current security measures include:

- SSH key authentication
- SSH password authentication disabled
- Root SSH login disabled
- No public port forwarding
- Secrets and environment files excluded from Git
- Application and Docker runtime data kept outside the repository

## Repository Structure

```text
.
├── .github/
│   └── workflows/
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

## Deployment

The application is deployed using Docker Compose.

Source changes are deployed by rebuilding the Docker image and recreating the Compose service.

Current deployment flow:

```text
Edit source
    |
    v
Build Docker image
    |
    v
Recreate Compose service
    |
    v
Verify container
    |
    v
Test application
```

## GitHub Actions

A basic GitHub Actions workflow currently validates the repository README.

It runs on pushes to `main` and on pull requests.

Current checks include:

- README exists
- No trailing spaces
- No lines longer than 120 characters

Automated application deployment to the Raspberry Pi is not configured yet.

## Current Status

Completed:

- Raspberry Pi OS installation and Linux base configuration
- SSH remote administration
- SSH key authentication and hardening
- External HDD configuration and persistent mounting
- Memotest deployment with Nginx
- Docker installation
- Docker and containerd storage migration to the external HDD
- Memotest containerization
- Docker Compose deployment
- Repository cleanup and Git ignore rules
- Basic GitHub Actions validation

## Roadmap

Planned work includes:

- GitHub Actions CI/CD
- Automated deployment to the Raspberry Pi
- Bash and systemd automation
- Azure integration
- Terraform infrastructure provisioning
- Monitoring and observability
- Additional security improvements
```