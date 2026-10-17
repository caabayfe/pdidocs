function showNotEligibleModal() {	
	var gDialog = new GlideModal('ds_hierarchy_not_enable_dialog');
	gDialog.setTitle(getMessage("Instance eligibility"));
	gDialog.setWidth(500);
	gDialog.render();
}
