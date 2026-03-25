import type { ScaffoldConfig } from '../../types/';

/** Pure function — returns the build script. */
export function generateBuild(_cfg: Pick<ScaffoldConfig, 'package'>): string {
 
  return `#!/bin/bash
# 空构建脚本 - 不生成任何文件

set -e

case \${MakeClean} in
    [Yy][Ee][Ss])
        echo "Cleaning..."
        ;;
esac

echo "Build completed (no files generated)"
`;
}

/** Pure function — returns the install script. */
export function generateInstall(cfg: Pick<ScaffoldConfig, 'package'>): string {
     const pkg = cfg.package;
  return `#!/bin/bash
# Install script for ${pkg} package

PKG_DIR=/tmp/_test_spk
rm -rf \$PKG_DIR
mkdir -p \$PKG_DIR

source /pkgscripts/include/pkg_util.sh

SOURCE_DIR="/source/${pkg}"

create_package_tgz() {
    local package_tgz_dir=/tmp/_package_tgz
    rm -rf \$package_tgz_dir && mkdir -p \$package_tgz_dir
    pkg_make_package \$package_tgz_dir "\${PKG_DIR}"
}

create_spk(){
    cd \${SOURCE_DIR}
    chmod +x INFO.sh
    ./INFO.sh > INFO
    cd - > /dev/null
    cp \${SOURCE_DIR}/INFO \$PKG_DIR/INFO
    mkdir -p /image/packages
    pkg_make_spk \${PKG_DIR} "/image/packages" \$(pkg_get_spk_family_name)
}

main() {
    create_package_tgz
    create_spk
}

main "\$@"
`;
}