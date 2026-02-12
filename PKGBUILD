pkgname=bible-reading-plan
pkgver=0.1.0
pkgrel=1
pkgdesc="Daily Bible reading app using Dr. Grant Horner's system"
arch=('x86_64')
url="https://github.com/ernestchuang/bible-reading-plans"
license=('MIT')
depends=('webkit2gtk-4.1' 'gtk3')
makedepends=('rust' 'cargo' 'nodejs' 'npm' 'pkgconf')
source=("$pkgname-$pkgver.tar.gz::https://github.com/ernestchuang/bible-reading-plans/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "bible-reading-plans-$pkgver"
    npm ci
    npm run build
    cd src-tauri
    cargo build --release
}

package() {
    cd "bible-reading-plans-$pkgver"
    install -Dm755 "src-tauri/target/release/bible-reading-plan" "$pkgdir/usr/bin/bible-reading-plan"
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/icons/hicolor/128x128/apps/bible-reading-plan.png"
    install -Dm644 /dev/stdin "$pkgdir/usr/share/applications/bible-reading-plan.desktop" <<EOF
[Desktop Entry]
Name=Bible Reading Plan
Exec=bible-reading-plan
Icon=bible-reading-plan
Type=Application
Categories=Education;
EOF
}
