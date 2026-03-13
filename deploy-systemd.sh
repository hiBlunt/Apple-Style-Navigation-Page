#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-apple-nav-page}"
INSTALL_DIR="${INSTALL_DIR:-/opt/apple-nav-page}"
PORT="${PORT:-8080}"
HOST="${HOST:-0.0.0.0}"
RUN_USER="${RUN_USER:-${SUDO_USER:-$(id -un)}}"
RUN_GROUP="${RUN_GROUP:-$(id -gn "$RUN_USER")}"
BINARY_NAME="nav-server"
SYSTEMD_UNIT_DIR="${SYSTEMD_UNIT_DIR:-/etc/systemd/system}"
SYSTEMCTL_BIN="${SYSTEMCTL_BIN:-systemctl}"
SKIP_ROOT_CHECK="${SKIP_ROOT_CHECK:-0}"
SKIP_CHOWN="${SKIP_CHOWN:-0}"
SYSTEMD_UNIT="${SYSTEMD_UNIT_DIR}/${SERVICE_NAME}.service"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

has_prebuilt_binary() {
    [[ -x "${PROJECT_DIR}/${BINARY_NAME}" ]]
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1" >&2
        exit 1
    fi
}

ensure_root() {
    if [[ "${SKIP_ROOT_CHECK}" == "1" ]]; then
        return
    fi

    if [[ "${EUID}" -ne 0 ]]; then
        echo "Please run this script with sudo or as root." >&2
        exit 1
    fi
}

ensure_auth_file() {
    if [[ -f "${PROJECT_DIR}/.auth" ]]; then
        return
    fi

    if [[ -f "${PROJECT_DIR}/.auth.example" ]]; then
        cp "${PROJECT_DIR}/.auth.example" "${PROJECT_DIR}/.auth"
        echo "Created .auth from .auth.example. Change the default password hash after deployment."
        return
    fi

    echo "Missing ${PROJECT_DIR}/.auth and ${PROJECT_DIR}/.auth.example." >&2
    exit 1
}

build_binary() {
    if has_prebuilt_binary; then
        echo "Using existing binary: ${PROJECT_DIR}/${BINARY_NAME}"
        return
    fi

    echo "No existing binary found, building Go binary..."
    (
        cd "${PROJECT_DIR}"
        CGO_ENABLED=0 go build -o "${BINARY_NAME}" main.go
    )
}

install_files() {
    echo "Installing application files to ${INSTALL_DIR}..."
    mkdir -p "${INSTALL_DIR}"

    install -m 0755 "${PROJECT_DIR}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
    install -m 0644 "${PROJECT_DIR}/index.html" "${INSTALL_DIR}/index.html"
    install -m 0644 "${PROJECT_DIR}/style.css" "${INSTALL_DIR}/style.css"
    install -m 0644 "${PROJECT_DIR}/script.js" "${INSTALL_DIR}/script.js"
    install -m 0644 "${PROJECT_DIR}/config.json" "${INSTALL_DIR}/config.json"
    install -m 0600 "${PROJECT_DIR}/.auth" "${INSTALL_DIR}/.auth"

    if [[ "${SKIP_CHOWN}" != "1" ]]; then
        chown -R "${RUN_USER}:${RUN_GROUP}" "${INSTALL_DIR}"
    fi
}

write_service_file() {
    echo "Writing systemd unit to ${SYSTEMD_UNIT}..."
    mkdir -p "${SYSTEMD_UNIT_DIR}"
    cat > "${SYSTEMD_UNIT}" <<EOF
[Unit]
Description=Apple Style Navigation Page
After=network.target

[Service]
Type=simple
User=${RUN_USER}
Group=${RUN_GROUP}
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/${BINARY_NAME} -ip ${HOST} -port ${PORT}
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
}

reload_and_start() {
    echo "Reloading systemd and restarting ${SERVICE_NAME}..."
    "${SYSTEMCTL_BIN}" daemon-reload
    "${SYSTEMCTL_BIN}" enable "${SERVICE_NAME}"
    "${SYSTEMCTL_BIN}" restart "${SERVICE_NAME}"
    "${SYSTEMCTL_BIN}" --no-pager --full status "${SERVICE_NAME}"
}

print_summary() {
    echo
    echo "Deployment completed."
    echo "Service: ${SERVICE_NAME}"
    echo "Install dir: ${INSTALL_DIR}"
    echo "Listen address: http://${HOST}:${PORT}"
    echo "Manage service with: systemctl status|restart|stop ${SERVICE_NAME}"
}

main() {
    ensure_root
    require_command install
    require_command "${SYSTEMCTL_BIN}"
    if ! has_prebuilt_binary; then
        require_command go
    fi
    ensure_auth_file
    build_binary
    install_files
    write_service_file
    reload_and_start
    print_summary
}

main "$@"
