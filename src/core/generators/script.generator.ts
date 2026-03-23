import type { ScaffoldConfig } from '../../types/';
import { SCRIPT_COMMENTS } from '../../data/script-lifecycle.data';

/** Pure function — returns the start-stop-status shell script. */
export function generateStartStopStatus(cfg: Pick<ScaffoldConfig, 'package'>): string {
  const pkg = cfg.package;
  return `#!/bin/sh
# scripts/start-stop-status — Package lifecycle controller
# Docs: https://help.synology.com/developer-guide/synology_package/scripts.html
#
# Available environment variables:
#   $SYNOPKG_PKGNAME       Package ID
#   $SYNOPKG_PKGVER        Package version
#   $SYNOPKG_PKGDEST       Install directory (e.g. /var/packages/${pkg}/target)
#   $SYNOPKG_PKGVAR        Data directory   (/var/packages/${pkg}/var)
#   $SYNOPKG_TEMP_LOGFILE  Content written here is shown to user after the action
#   $SYNOPKG_PKG_STATUS    Current action: INSTALL / UPGRADE / UNINSTALL / START / STOP

PKG_NAME="${pkg}"
PKG_DEST="$SYNOPKG_PKGDEST"
PKG_VAR="$SYNOPKG_PKGVAR"

case "$1" in
    start)
        # TODO: start your service
        # Example (Node.js): node "$PKG_DEST/app/index.js" &
        # Example (binary):  "$PKG_DEST/bin/$PKG_NAME" --daemon &
        echo "Starting $PKG_NAME..." > "$SYNOPKG_TEMP_LOGFILE"
        exit 0
        ;;

    stop)
        # TODO: stop your service
        # Example: kill $(cat /var/run/${pkg}.pid)
        echo "Stopping $PKG_NAME..." > "$SYNOPKG_TEMP_LOGFILE"
        exit 0
        ;;

    status)
        # Exit codes:
        #   0   Running
        #   1   Dead; /var/run pid file exists
        #   2   Dead; /var/lock lock file exists
        #   3   Not running
        #   4   Unknown
        #   150 Corrupt; needs reinstall
        # if pgrep -f "$PKG_NAME" > /dev/null; then exit 0; fi
        exit 3
        ;;

    prestart)
        # Called before start (requires precheckstartstop=yes).
        # Also called on boot in DSM 7.0+. Non-zero blocks start.
        exit 0
        ;;

    prestop)
        # Called before stop (requires precheckstartstop=yes). Non-zero blocks stop.
        exit 0
        ;;
esac

exit 0
`;
}

/** Pure function — returns a named lifecycle script (preinst, postinst, etc.). */
export function generateScript(name: string): string {
  const comment = SCRIPT_COMMENTS[name] ?? name;
  return `#!/bin/sh
# scripts/${name} — ${comment}
#
# Environment variables:
#   $SYNOPKG_PKGNAME, $SYNOPKG_PKGVER, $SYNOPKG_PKGDEST
#   $SYNOPKG_TEMP_LOGFILE  — Write messages here to show to user
#   $SYNOPKG_DSM_LANGUAGE  — UI language (enu/chs/cht/jpn...)
#   $SYNOPKG_PKG_STATUS    — INSTALL / UPGRADE / UNINSTALL

exit 0
`;
}