# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=2

MY_BUILD=${PV/[0-9]*\.[0-9]*\.}
MY_PV=${PV%\.[0-9]*}

DESCRIPTION="A very mini BT client."
HOMEPAGE="http://www.utorrent.com"
SRC_URI="http://download.utorrent.com/linux/${PN}-${MY_PV}-${MY_BUILD}.tar.gz"

LICENSE="as-is"
SLOT="0"
KEYWORDS="-* x86"
IUSE=""

DEPEND=""
RDEPEND="${DEPEND}"

D="/opt/utorrent.com"

src_install() {
	declare UTORRENT_SERVER_HOME="/opt/utorrent.com/server"

	#local src=${S%${PN}-${PV}}
	#einfo $src
	#mv "${src}bittorrent-server-v3_0" "${D}"

	insinto ${UTORRENT_SERVER_HOME} || die
	dodir ${UTORRENT_SERVER_HOME} || die
	doins -r bittorrent-server-v3_0/* || die

	fperms 0777 ${UTORRENT_SERVER_HOME}
	fperms 0755 "${UTORRENT_SERVER_HOME}/utserver"
}

