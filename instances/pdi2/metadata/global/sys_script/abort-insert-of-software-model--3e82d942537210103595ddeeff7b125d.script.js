(function executeRule(current, previous) {
	var tableName = current.child.sys_class_name;
	var SOFTWARE_MODELS = 'cmdb_software_product_model';
	var gr = new GlideRecord(tableName);
	if (current.parent.bundle_assets && global.ModelUtils.isAncestor(gr, SOFTWARE_MODELS)) {
		var msg = gs.getMessage('Software model cannot be added as a component to asset bundled model');
		gs.addErrorMessage(msg);
		global.ModelUtils.setAbortAction(current, true);
	}
}(current, previous));
