function createBreakdownSource() {
	var gDialog = new GlideModal('new_bucket_group_source');
	gDialog.setTitle(g_i18n.getMessage('New Bucket Group and Breakdown Source'));
	gDialog.setWidth(500);
	gDialog.render();
}
