# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

DESCRIPTION="Faenza GTK+ Icons"
HOMEPAGE="http://tiheum.deviantart.com/art/Faenza-Icons-173323228"
#SRC_URI="http://www.deviantart.com/download/173323228/Faenza_Icons_by_tiheum.zip"
SRC_URI="http://fc00.deviantart.net/fs70/f/2010/238/4/8/Faenza_Icons_by_tiheum.zip"

LICENSE="GPL"
SLOT="0"
KEYWORDS="x86"
IUSE=""

DEPEND=""
RDEPEND="${DEPEND}"

DIST_NAME="fedora"

src_unpack() {
	unpack "${A}"
	cd "${WORKDIR}"
	tar -xzf Faenza.tar.gz || die "upacking failed."
	tar -xzf Faenza-Dark.tar.gz || die "upacking failed."
	tar -xzf emesene-faenza-theme.tar.gz || die "upacking failed."
}

set_distributor_logo() {
	local icon_name="distributor-logo-${DIST_NAME}"

	#cd ${1}
	dosym "${1}/${icon_name}.${2}" "${1}/distributor-logo.${2}" || die "dosym failed."
}

set_start_here_logo() {
	local icon_name="${DIST_NAME}-logo"

	#cd ${1}
	dosym "${1}/${icon_name}.${2}" "${1}/start-here.${2}"
}

set_gnome_start_here_logo() {
	local icon_name="start-here-gnome"

	#cd ${1}
	dosym "${1}/${icon_name}.${2}" "${1}/start-here.${2}"
}
src_install() {
	DST="/usr/share/icons"
	insinto "${DST}"
	doins -r "Faenza" || die "install faenza failed."
	doins -r "Faenza-Dark" || die "install faenza-dark failed."

	set_distributor_logo "${DST}/Faenza/places/scalable" "svg"
	set_distributor_logo "${DST}/Faenza/places/48" "png"
	set_distributor_logo "${DST}/Faenza/places/32" "png"
	set_distributor_logo "${DST}/Faenza/places/24" "png"
	set_distributor_logo "${DST}/Faenza/places/22" "png"

	set_start_here_logo "${DST}/Faenza/places/scalable" "svg"
	set_start_here_logo "${DST}/Faenza/places/48" "png"
	set_start_here_logo "${DST}/Faenza/places/32" "png"
	set_start_here_logo "${DST}/Faenza/places/24" "png"
	set_start_here_logo "${DST}/Faenza/places/22" "png"

	set_gnome_start_here_logo "${DST}/Faenza-Dark/places/scalable" "svg"
	set_gnome_start_here_logo "${DST}/Faenza-Dark/places/48" "png"
	set_gnome_start_here_logo "${DST}/Faenza-Dark/places/32" "png"
	set_gnome_start_here_logo "${DST}/Faenza-Dark/places/24" "png"
	set_gnome_start_here_logo "${DST}/Faenza-Dark/places/22" "png"

	DST="/usr/share"
	insinto "${DST}"
	doins -r "emesene" || die "install emesene-theme failed."

	dodoc AUTHORS ChangeLog COPYING
}
