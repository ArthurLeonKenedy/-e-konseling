#!/bin/bash
# Script untuk setup Supervisor di Ubuntu/Debian

echo "Mulai instalasi Supervisor..."

# Update package list dan install supervisor
sudo apt-get update
sudo apt-get install -y supervisor

echo "Supervisor berhasil diinstall."

# Menyalin file konfig (pastikan path disesuaikan pada file laravel-worker.conf)
# Contoh: kita asumsikan file laravel-worker.conf berada di folder yang sama dengan script ini
echo "Menyalin konfigurasi worker..."
sudo cp laravel-worker.conf /etc/supervisor/conf.d/laravel-worker.conf

# Membuat file log yang dibutuhkan oleh supervisor
# Ganti "/path/to/your/ekonseling/backend" dengan path project asli di server
PROJECT_PATH="/path/to/your/ekonseling/backend"
touch $PROJECT_PATH/storage/logs/worker.log
# Set permission jika menggunakan web server standar (www-data)
sudo chown www-data:www-data $PROJECT_PATH/storage/logs/worker.log

# Reread dan update supervisor
sudo supervisorctl reread
sudo supervisorctl update

# Start worker
sudo supervisorctl start laravel-worker:*

echo "Setup selesai. Berikut status service:"
sudo supervisorctl status
