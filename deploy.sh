#!/bin/bash
set -e

echo "=================================================="
echo "  MAGISTRATURA E-DARCHA — YASHINDEK TEZKOR DEPLOY "
echo "=================================================="

# 1. Eng yangi Node.js ni tanlash (22 yoki 20)
NODE_BIN=""
for v in 22 20 18; do
    if [ -d "/opt/alt/alt-nodejs$v/root/usr/bin" ]; then
        NODE_BIN="/opt/alt/alt-nodejs$v/root/usr/bin"
        break
    elif [ -d "/opt/cpanel/ea-nodejs$v/bin" ]; then
        NODE_BIN="/opt/cpanel/ea-nodejs$v/bin"
        break
    fi
done

if [ -n "$NODE_BIN" ]; then
    export PATH="$NODE_BIN:$PATH"
fi

echo "✓ Node versiyasi: $(node -v 2>/dev/null || echo 'Mavjud emas')"

# 2. Ishchi papkani tayyorlash
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="$HOME/magister-live"
mkdir -p "$WORK_DIR"

echo "✓ Tayyor yig'ilgan arxiv ochilmoqda..."
tar -xzf "$BASE_DIR/magister-bundle.tar.gz" -C "$WORK_DIR"
cd "$WORK_DIR"

# .env sozlamasi
if [ ! -f .env ]; then
    echo "SESSION_SECRET=magister-secret-key-prod-$(date +%s)" > .env
fi

# 3. Eski server jarayonlarini to'xtatish
pkill -f "node.*server.js" 2>/dev/null || true
sleep 1

# 4. Bo'sh portni aniqlash
APP_PORT=$(node -e 'const s=require("net").createServer().listen(0,()=>{console.log(s.address().port);process.exit(0)})' 2>/dev/null || echo "3000")
echo "✓ Ilova $APP_PORT portida ishga tushirilmoqda..."

# 5. Ilovani orqa fonda ishga tushirish (0.2 soniyada tayyor bo'ladi!)
PORT=$APP_PORT HOSTNAME=127.0.0.1 nohup node server.js > app.log 2>&1 &
sleep 2

# 6. magister.nsuni.uz domeniga .htaccess ulaymiz
TARGET_DIR="$HOME/magister.nsuni.uz"
mkdir -p "$TARGET_DIR"

cat << EOF > "$TARGET_DIR/.htaccess"
DirectoryIndex disabled
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:${APP_PORT}/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:${APP_PORT}/\$1 [P,L]
EOF

echo "=================================================="
echo "  NATIJA TEKSHIRILMOQDA: "
echo "=================================================="
curl -I -s "http://127.0.0.1:${APP_PORT}" | head -n 5

echo "=================================================="
echo "✓ TAYYOR! http://magister.nsuni.uz manziliga kiring!"
echo "=================================================="
