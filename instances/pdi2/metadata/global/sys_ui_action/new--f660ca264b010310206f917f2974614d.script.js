function showNotEligibleModal() {	
	var gDialog = new GlideModal('ds_cdc_exclusions_not_enable_dialog');
	gDialog.setTitle(getMessage("Instance eligibility"));
	gDialog.setWidth(500);
	gDialog.render();
}
