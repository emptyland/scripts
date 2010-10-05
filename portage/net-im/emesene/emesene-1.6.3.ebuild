# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

DESCRIPTION="A Open Source MSN Implement"
HOMEPAGE=""
SRC_URI="http://downloads.sourceforge.net/project/emesene/${P}/${P}.tar.gz"

LICENSE="LGPL"
SLOT="0"
KEYWORDS="x86"
IUSE="dbus"

DEPEND=">=dev-lang/python-2.6
	dev-python/pycairo
	>=dev-python/pygtk-2.10
	
	dbus? ( dev-python/dbus-python )"
RDEPEND="${DEPEND}"

src_compile() {
	cd "${WORKDIR}/${P}"
	python setup.py build || die "build failed."
}

src_install() {
	DST="/usr/share/emesene"

	insinto	"${DST}"
	doins *.py || die "doins failed."
	doins hotmlog.htm || die "doins failed."

	doins -r emesenelib || die "install lib failed."
	doins -r plugins_base || die "install plugin base failed."
	doins -r smilies || die "install smilies failed."
	doins -r sound_themes || die "install sound themes failed."
	doins -r themes || die "install themes failed."
	doins -r abstract || die "install abstract failed."
	doins -r conversation_themes || die "install conversation themes failed."

	exeinto "${DST}"
	doexe emesene || die "install exe file failed."

	dosym "${DST}/emesene" "/usr/bin/emesene" || die "create symlink failed."

	insinto "/usr/share/locale"
	doins -r po/* || die "install .mo file failed."

	insinto "/usr/share/icons/hicolor/scalable/apps"
	doins "misc/emesene.svg" || die "install icons failed."

	insinto "/usr/share/pixmap"
	doins "misc/emesene.png" || die "install icons failed."

	insinto "/usr/share/applications"
	doins "misc/emesene.desktop" || die "install desktop failed."

	dodoc README PSF COPYING
	doman "misc/emesene.1" || die "install man failed."
}

