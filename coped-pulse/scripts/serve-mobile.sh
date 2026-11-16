#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Removing stale Vite HMR file (public/hot) if present..."
rm -f public/hot

echo "==> Building production frontend assets for mobile..."
npm run build

WSL_IP="$(hostname -I | awk '{print $1}')"
PORT="${APP_PORT:-8081}"

is_port_in_use() {
    python3 - "$1" <<'PY'
import socket, sys
port = int(sys.argv[1])
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
    s.bind(("0.0.0.0", port))
    sys.exit(1)
except OSError:
    sys.exit(0)
finally:
    s.close()
PY
}

if is_port_in_use "${PORT}"; then
    echo "==> Port ${PORT} is already in use. Stopping any existing local PHP server on port ${PORT}..."
    pkill -f "artisan serve" 2>/dev/null || true
    pkill -f "php -S .*:${PORT}" 2>/dev/null || true
    sleep 1
fi

while is_port_in_use "${PORT}"; do
    echo "==> Port ${PORT} is still occupied; trying $((PORT + 1))..."
    PORT=$((PORT + 1))
done

echo ""
echo "============================================================"
echo " CoPED PULSE Mobile & Android Server"
echo "============================================================"
echo " Android Emulator URL : http://10.0.2.2:${PORT}"
echo " WSL2 Local IP URL    : http://${WSL_IP}:${PORT}"
echo ""
echo " If testing from a physical Android phone over Wi-Fi (WSL2):"
echo " Run this once in Windows PowerShell (as Administrator):"
echo "   netsh interface portproxy add v4tov4 listenport=${PORT} listenaddress=0.0.0.0 connectport=${PORT} connectaddress=${WSL_IP}"
echo " Then open http://<YOUR_WINDOWS_WIFI_IP>:${PORT} in Chrome or the APK."
echo "============================================================"
echo ""

exec php artisan serve --host=0.0.0.0 --port="${PORT}" --no-reload
