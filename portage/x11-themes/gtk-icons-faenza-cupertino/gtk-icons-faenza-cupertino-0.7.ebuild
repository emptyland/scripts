# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

DESCRIPTION="Faenza GTK+ Icons"
HOMEPAGE="http://thedeviantmars.deviantart.com/#/d30f04b"
SRC_URI="http://fc03.deviantart.net/fs70/f/2010/285/d/d/faenza_cupertino_4_kde_by_thedeviantmars-d30f04b.zip"

LICENSE="GPL"
SLOT="0"
KEYWORDS="x86"
IUSE=""

DEPEND=""
RDEPEND="${DEPEND}"

DIST_NAME="fedora"

inherit eutils

#EPATCH_SOURCE="${FILESDIR}"
EPATCH_FORCE="yes"

src_unpack() {
	unpack "${A}"
	cd "${WORKDIR}"
	tar -xzf Faenza.tar.gz || die "upacking failed."
	mv Faenza Faenza-Cupertino
}

set_distributor_logo() {
	local icon_name="distributor-logo-${DIST_NAME}"

	dosym "${1}/${icon_name}.${2}" "${1}/distributor-logo.${2}" || die "dosym failed."
}

set_start_here_logo() {
	local icon_name="${DIST_NAME}-logo"

	dosym "${1}/${icon_name}.${2}" "${1}/start-here.${2}"
}

set_gnome_start_here_logo() {
	local icon_name="start-here-gnome"

	dosym "${1}/${icon_name}.${2}" "${1}/start-here.${2}"
}

src_prepare() {
	epatch "${FILESDIR}/00_name_and_cleanup.patch"
}

src_install() {
	DST="/usr/share/icons"
	insinto "${DST}"
	doins -r "Faenza-Cupertino" || die "install faenza failed."

	set_distributor_logo "${DST}/Faenza-Cupertino/places/scalable" "svg"
	set_distributor_logo "${DST}/Faenza-Cupertino/places/48" "png"
	set_distributor_logo "${DST}/Faenza-Cupertino/places/32" "png"
	set_distributor_logo "${DST}/Faenza-Cupertino/places/24" "png"
	set_distributor_logo "${DST}/Faenza-Cupertino/places/22" "png"

	set_start_here_logo "${DST}/Faenza-Cupertino/places/scalable" "svg"
	set_start_here_logo "${DST}/Faenza-Cupertino/places/48" "png"
	set_start_here_logo "${DST}/Faenza-Cupertino/places/32" "png"
	set_start_here_logo "${DST}/Faenza-Cupertino/places/24" "png"
	set_start_here_logo "${DST}/Faenza-Cupertino/places/22" "png"
}
