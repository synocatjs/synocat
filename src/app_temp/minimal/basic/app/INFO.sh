#!/bin/bash

source /pkgscripts/include/pkg_util.sh

package="v2"
version="1.0.0"
arch="$(pkg_get_platform)"
maintainer="Synocatjs"
description="A minimal Synology DSM package demo"
os_min_ver="7.0-40000"

pkg_dump_info