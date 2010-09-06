# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: Exp $

inherit versionator

MY_PV=$(replace_version_separator 2 '-')

DESCRIPTION="Console linux version of popular Windows bittorrent client"
HOMEPAGE="http://www.utorrent.com/downloads/linux"
SRC_URI="http://download.utorrent.com/linux/${PN}-${MY_PV}.tar.gz"

LICENSE="EULA"
SLOT="0"

KEYWORDS="~amd64 ~x86"
IUSE=""
RESTRICT="strip"

RDEPEND="amd64? (
		app-emulation/emul-linux-x86-compat
		app-emulation/emul-linux-x86-baselibs )"

S="bittorrent-server-v$(get_major_version)_$(get_version_component_range 2)"

src_install() {
	insinto "/opt/${PN}/share/"
	doins "${S}/webui.zip" || die "Failed to install webui"

	exeinto "/opt/${PN}/bin/"
	doexe "${S}/utserver" || die "Failed to install utorrent"

	insinto "/opt/${PN}/doc"
	doins "${S}/docs/uTorrent_Server.pdf" || die "Failed to install manual"

	doins "${S}/docs/uTorrent_Server.html" || die "Failed to install manual"
	doins "${S}/docs/style.css" || die "Failed to install manual"
	doins "${S}/docs/footer_ut_address.gif" || die "Failed to install manual"
	doins "${S}/docs/ut-logo.gif" || die "Failed to install manual"

	exeinto "/usr/bin"
	doexe "${FILESDIR}/utserver-start" || die "Failed to install script"
	doexe "${FILESDIR}/utserver-stop" || die "Failed to install script"

	ewarn "This is alpha-version of uTorrent 3.0. It may fail to run on amd64 systems!"
	einfo "To start utorrent-server type: /opt/${PN}/bin/utserver"
	einfo "uTorrent currently stores it's config in pwd, so be careful! It's recomended to create ~/.utorrent and start it from here"
	einfo "uTorrent uses webui from current directory, by default, so be careful! Config it first! You can find webui.zip in /opt/${PN}/share/"
}
