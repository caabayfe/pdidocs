function createBreakdownSource() {
	var dd = new GlideDialogWindow('new_bucket_group_source');
	dd.setTitle(new GwtMessage().getMessage('New Bucket Group and Breakdown Source'));
	dd.setWidth(500);
	dd.render();
}
