function resetTextSearchCaches() {
	var gDialog = new GlideDialogWindow("dialog_text_search_cache_reset");
	gDialog.setSize(400, 250);
	gDialog.setTitle('Reset Text Search caches');
	gDialog.render();
}
