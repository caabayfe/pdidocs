function goThere(suffix, id) {
	var url = new GlideURL('/' + suffix);
	url.addParam('id', id);
	GlideDialogWindow.get().destroy();
	window.g_navigation.openPopup(url.getURL(), 'try_portal_page', '', false);
}
