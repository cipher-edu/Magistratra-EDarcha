#!/bin/bash
set -e

echo "=== 1. Node.js muhitini sozlash ==="
for p in /opt/alt/alt-nodejs*/root/usr/bin /opt/cpanel/ea-nodejs*/bin "$HOME"/nodevenv/*/bin "$HOME"/.nvm/versions/node/*/bin; do
    if [ -d "$p" ]; then
        export PATH="$p:$PATH"
    fi
done

echo "Node versiyasi: $(node -v 2>/dev/null || echo 'Mavjud emas')"
echo "NPM versiyasi: $(npm -v 2>/dev/null || echo 'Mavjud emas')"

echo "=== 2. Magistratra-EDarcha/web sozlamalari ==="
cd "$(dirname "$0")/web"

if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env fayli yaratildi."
fi

echo "=== 3. Paketlarni o'rnatish ==="
npm install

echo "=== 4. Loyihani yig'ish (build) ==="
npm run build

echo "=== 5. Bo'sh portni aniqlash va ishga tushirish ==="
APP_PORT=$(node -e 'const s=require("net").createServer().listen(0,()=>{console.log(s.address().port);process.exit(0)})' 2>/dev/null || echo "3000")
echo "Ilova $APP_PORT portida ishga tushirilmoqda..."

pkill -f "next.*start" 2>/dev/null || true
sleep 1

PORT=$APP_PORT nohup node node_modules/next/dist/bin/next start -p $APP_PORT > app.log 2>&1 &
sleep 4

echo "=== 6. magister.nsuni.uz domeniga ulash (.htaccess) ==="
TARGET_DIR="/home/kpinsuni/magister.nsuni.uz"
if [ ! -d "$TARGET_DIR" ]; then
    TARGET_DIR="$HOME/magister.nsuni.uz"
fi
mkdir -p "$TARGET_DIR"

cat << EOF > "$TARGET_DIR/.htaccess"
DirectoryIndex disabled
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:${APP_PORT}/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:${APP_PORT}/\$1 [P,L]
EOF

echo "=== 7. Natijani tekshirish ==="
if curl -s -I "http://127.0.0.1:${APP_PORT}" | grep -q "200\|307\|308\|302"; then
    echo "MUVAFFAQIN! Loyiha serverda muvaffaqiyatli ishga tushdi (Port: $APP_PORT)!"
    echo "Brauzerda http://magister.nsuni.uz manziliga kirib tekshirishingiz mumkin."
else
    echo "Port tekshiruvi:"
    curl -I -s "http://127.0.0.1:${APP_PORT}" || true
    echo "Loglar (app.log):"
    cat app.log | tail -n 20 || true
fi
