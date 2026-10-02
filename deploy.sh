#!/bin/bash
set -e

echo "=== 1. Node.js muhitini sozlash ==="
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
    echo "Topilgan zamonaviy Node yo'li: $NODE_BIN"
fi

NODE_VER=$(node -v 2>/dev/null || echo "mavjud emas")
echo "Faol Node versiyasi: $NODE_VER"
echo "Faol NPM versiyasi: $(npm -v 2>/dev/null || echo 'mavjud emas')"

echo "=== 2. Magistratra-EDarcha/web sozlamalari ==="
cd "$(dirname "$0")/web"

if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env fayli yaratildi."
fi

# Eski Node 9 dan qolgan noto'g'ri paketlar bo'lsa tozalash
if [ -d "node_modules" ] && [ -f "node_modules/next/dist/bin/next" ]; then
    NODE_MAJOR=$(node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null || echo "0")
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "XATOLIK: Node.js versiyasi kamida v18 bo'lishi kerak! Hozirgi: $NODE_VER"
        exit 1
    fi
fi

echo "=== 3. Paketlarni toza o'rnatish ==="
rm -rf node_modules package-lock.json
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
