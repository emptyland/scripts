# Copyright 1999-2010 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2
# $Header: $

EAPI=3

DESCRIPTION="Equinox GTK+ Theme Engine"
HOMEPAGE="http://gnome-look.org/content/show.php/Equinox+GTK+Engine?content=121881"
SRC_URI="http://gnome-look.org/CONTENT/content-files/121881-equinox-${PV}.tar.bz2"

LICENSE="GPL-2"
SLOT="0"
KEYWORDS="x86"
IUSE=""

DEPEND="" #">=X11-libs/gtk+-2.10"
RDEPEND="${DEPEND}
	dev-util/pkgconfig"

S="${WORKDIR}/equinox-${PV}"

src_unpack() {
	unpack ${A}
	cd "${WORKDIR}"
	tar -xzf equinox-gtk-engine.tar.gz || die "unpacking failed."
	tar -xzf equinox-themes.tar.gz || die "unpacking failed."
}

src_compile() {
	econf --disable-dependency-tracking --enable-animation
	emake || die "emake failed."
}

src_install() {
	emake DESTDIR="${D}" install || die "emake install failed."
	dodoc AUTHORS ChangeLog NEWS README
	insinto /usr/share/themes
	doins -r ../Equinox* || die "doins failed."
}
