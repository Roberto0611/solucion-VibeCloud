# steps for setting up linux EC2
sudo apt install php php-cli php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-json php-bcmath unzip -y
sudo apt install composer -y

# ya dentro del proyecto
composer install
composer require laravel/breeze --dev
npm install react@rc react-dom@rc leaflet
npm install react-leaflet@next
npm install -D @types/leaflet
npm install @react-three/fiber @react-three/drei three
npm install motion
npm install framer-motion
npm install recharts

npm install

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20

sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.4-pgsql -y

npm install @react-three/fiber @react-three/drei three @radix-ui/react-popover cmdk react-day-picker react-resizable-panels
npm install -D @types/three
mpm install proj4
npm install leaflet-routing-machine
npm install recharts react-is

composer require aws/aws-sdk-php
composer require google-gemini-php/laravel
