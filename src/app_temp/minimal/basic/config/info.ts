type InfoProp = {
  packageName: string,
  packageVersion: string,
  maintainer: string,
  description: string,
  osMinVer:string,
}


export const INFO = ({packageName,packageVersion,maintainer,description,osMinVer}:InfoProp): string[] => {
  return [
    "#!/bin/bash",
    'source /pkgscripts/include/pkg_util.sh',
    "# ===== basic config =====",
    `package="${packageName}"`,
    `version="${packageVersion}"`,
    'arch="$(pkg_get_platform)"',
    `maintainer="${maintainer}"`,
    `description="${description}"`,
    `os_min_ver="${osMinVer}"`,
    "",
    "pkg_dump_info"
  ];
};