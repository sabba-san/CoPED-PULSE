#!/bin/bash
export PATH="/home/dinos_dilia/.local/node/bin:/home/dinos_dilia/.config/herd-lite/bin:$PATH"
export PHP_INI_SCAN_DIR="/home/dinos_dilia/.config/herd-lite/bin:$PHP_INI_SCAN_DIR"
cd /home/dinos_dilia/coped_pulse/CoPED-PULSE/coped-pulse
php artisan serve --host=127.0.0.1 --port=8000
