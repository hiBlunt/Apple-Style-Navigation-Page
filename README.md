# Apple-Style 4K Navigation Page

A premium, privacy-focused, zero-dependency personal navigation dashboard designed for high density on 4K displays.

## 🌟 Features
- **Apple Aesthetics**: Glassmorphism, squircle icons, SF Pro typography.
- **4K High Density**: Uses CSS Grid for intelligent multi-column layout.
- **Visual Editor**: Built-in, password-protected visual edit mode to add, update, or remove links.
- **Zero-Dependency Backend**: A single Go file (`main.go`) serves the site and handles data persistence. No Node.js, PHP, or external databases required.
- **Data Persistence**: Changes made in the browser are securely written back to the backend `config.json` file.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Go 1.18 or higher](https://go.dev/dl/) installed.

### Initial Setup
Before running the server for the first time, you must create the authentication file. We have provided an example file with the default password.

```bash
cp .auth.example .auth
```
*(The default password hash in this file is for the password: `password`)*

### Run
To start the server locally, open your terminal in the project directory and run:
```bash
go run main.go
```
The dashboard will be available at `http://localhost:8080`.

**Default Admin Password**: `password` (Used to unlock Edit Mode in the top right corner).

---

## 🛠️ Deployment (Production)

The beauty of this project is that it compiles into a single executable file. You only need the executable and the front-end files (`index.html`, `style.css`, `script.js`, `config.json`) deployed together.

### 1. Build the Executable
Cross-compile the Go application for your target server environment.

**For Linux (amd64)**:
```bash
GOOS=linux GOARCH=amd64 go build -o nav-server main.go
```

**For Windows**:
```bash
GOOS=windows GOARCH=amd64 go build -o nav-server.exe main.go
```

**For macOS**:
```bash
go build -o nav-server main.go
```

### 2. Move Files to Server
Upload the compiled executable (`nav-server`) along with the following static files to a folder on your server (e.g., `/opt/nav`):
- `index.html`
- `style.css`
- `script.js`
- `config.json`

Ensure the user running the server has **write permissions** for `config.json`.

### 3. Run the Server

#### Option A: Running with CLI Parameters (Direct)
You can directly execute the binary. It supports `-ip` and `-port` flags to avoid conflicts.
```bash
./nav-server -port 80 -ip 0.0.0.0
```

#### Option B: Running in Background (nohup)
```bash
nohup ./nav-server -port 8080 > server.log 2>&1 &
```

#### Option C: Systemd Service (Recommended for Linux VMs)
To keep the service running perpetually on Linux, create a systemd service file.

Create `/etc/systemd/system/nav-server.service`:
```ini
[Unit]
Description=Apple-Style Navigation Server
After=network.target

[Service]
Type=simple
User=your_linux_user
WorkingDirectory=/opt/nav
ExecStart=/opt/nav/nav-server -port 8080
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable nav-server
sudo systemctl start nav-server
sudo systemctl status nav-server
```

#### One-Click Deployment Script
This repo also includes a one-click deployment script for Linux servers with `systemd`.

Run it from the project root:
```bash
chmod +x deploy-systemd.sh
sudo ./deploy-systemd.sh
```

Optional environment variables:
```bash
sudo SERVICE_NAME=apple-nav-page PORT=8080 HOST=0.0.0.0 INSTALL_DIR=/opt/apple-nav-page ./deploy-systemd.sh
```

By default, redeployments keep the existing server-side `config.json` and `.auth` in the install directory. If you want to overwrite them from the repo copy during deployment, set:
```bash
sudo FORCE_OVERWRITE_CONFIG=1 FORCE_OVERWRITE_AUTH=1 ./deploy-systemd.sh
```

The script will:
- build the Go binary
- install the binary and required static files into the target directory
- create `/etc/systemd/system/<service>.service`
- enable and start the service automatically

After deployment, manage it with:
```bash
sudo systemctl status apple-nav-page
sudo journalctl -u apple-nav-page -f
```

#### Option D: Docker (Recommended for Containerized Environments)
If you prefer running the application inside a Docker container, we provide a multi-stage `Dockerfile` that produces a tiny, zero-dependency Alpine image.

1. **Build the image**:
   ```bash
   docker build -t apple-nav-page .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8080:8080 --name nav -v $(pwd)/config.json:/app/config.json -v $(pwd)/.auth:/app/.auth apple-nav-page
   ```
   *(Note: Binding `config.json` and `.auth` as volumes ensures your links and password changes persist even if the container is restarted or destroyed.)*

### 4. Reverse Proxy (Optional but Recommended)
For HTTPS and domain pointing, use Nginx or Caddy to proxy traffic to your chosen port (e.g., `:8080`).

----

## 🔐 Configuration & Security

The configuration and link structure are stored in `config.json`.

### Changing the Admin Password
The password is required to save edits. By default, it is hash-checked against the `passwordHash` in `config.json`. 

To change the edit mode password:
1. Generate a SHA-256 hash of your new password. (You can use an online tool, or run `echo -n "yourNewPass" | shasum -a 256` on Linux/Mac).
2. Open the `.auth` file in the root directory.
3. Replace the old hash with your new valid SHA-256 string (just the string itself, no JSON formatting needed).
4. Restart the server.
