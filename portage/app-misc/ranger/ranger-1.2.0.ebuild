# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

DESCRIPTION="A Vim Style File Manager"
HOMEPAGE="http://savannah.nongnu.org/projects/ranger/"
SRC_URI="http://download.savannah.gnu.org/releases/ranger/releases/${P}.tar.gz"

LICENSE="GPL"
SLOT="0"
KEYWORDS="x86"
IUSE=""

DEPEND=">=dev-lang/python-2.6"
RDEPEND="${DEPEND}
	dev-util/pkgconfig"


src_install() {
	emake DESTDIR="${D}" install || die "emake install failed."
	dodoc COPYING CHANGELOG README HACKING
}
