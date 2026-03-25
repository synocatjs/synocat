export const START_STOP_STATUS_SCRIPT: string[] = [
  "#!/bin/sh",
  "",
  'case "$1" in',
  "    start)",
  "        ;;",
  "    stop)",
  "        ;;",
  "    status)",
  "        ;;",
  "esac",
  "",
  "exit 0",
];
