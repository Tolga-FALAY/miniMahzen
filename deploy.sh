#!/bin/bash

# miniMahzen Otomatik Dağıtım (Deployment) Scripti
echo "================================================="
echo "   miniMahzen Güncellemesi Başlatılıyor...       "
echo "================================================="

# 1. Proje ana dizinine git (Hetzner'deki kurulum dizini)
cd /var/www/miniMahzen || exit

echo ">>> 1. Yerel değişiklikler temizleniyor..."
git reset --hard HEAD

echo ">>> 2. En güncel kodlar GitHub'dan çekiliyor..."
git pull

echo ">>> 3. Bağımlılıklar güncelleniyor..."
# Backend bağımlılıkları
cd backend || exit
npm install
cd ..

# Frontend bağımlılıkları ve build
cd frontend || exit
npm install
echo ">>> 4. Frontend (React) projesi derleniyor..."
npm run build
cd ..

echo ">>> 5. Backend servisi (PM2) yeniden başlatılıyor..."
pm2 restart miniMahzen || pm2 start backend/server.js --name "miniMahzen"

echo "================================================="
echo "   Güncelleme Başarıyla Tamamlandı!              "
echo "================================================="
