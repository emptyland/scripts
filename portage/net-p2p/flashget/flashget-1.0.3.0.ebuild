# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

inherit versionator

MY_PV=$(replace_version_separator 3 '-')

DESCRIPTION="A misc protocol download tool."
HOMEPAGE="www.flashget.com"
SRC_URI="http://bbs.flashget.com/download/${PN}-${MY_PV}_cn.tar.gz"

LICENSE="EULA"
SLOT="0"
KEYWORDS="amd64 x86"
IUSE=""
RESTRICT="strip"

DEPEND=""
RDEPEND="${DEPEND}
	>=x11-libs/gtk+-2.14.7
	amd64? (
		app-emulation/emul-linux-x86-compat
		app-emulation/emul-linux-x86-baselibs )"

S="${PN}-${PV%\.[0-9]*}"


check_shared_lib() {
	local aexpat=`ldconfig -v 2>/dev/null|grep libexpat.so.0`
	if [ -z  "$aexpat" ]; then
		local slib=`whereis libexpat.so.|awk {'print $2'}`
		if [ ! -z "$slib" ]; then
			dosym $slib /usr/lib/libexpat.so.0 || die
			ldconfig 2>/dev/null
			einfo "Make a link for libexpat.so.0"
		else
			ewarn "Not Found libexpat.so"
		fi
	fi
}

src_install() {
	FLASHGET_HOME="/opt/flashget"

	check_shared_lib

	dodir ${FLASHGET_HOME} || die
	insinto ${FLASHGET_HOME}
	doins "${S}/flashget.png" || die
	dodoc "${S}/README" || die

	exeinto ${FLASHGET_HOME}
	doexe "${S}/flashget" || die

	local APPS="/usr/share/applications"
	sed -i "${S}/flashget.desktop" -e "s/Exec=.*$/Exec=\/opt\/flashget\/flashget/"
	sed -i "${S}/flashget.desktop" -e "s/Icon=.*$/Icon=\/opt\/flashget\/flashget.png/"
	insinto ${APPS}
	doins "${S}/flashget.desktop" || die
}
