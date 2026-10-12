if (RP.isRelatedList() && gs.getUser().hasRole('model_manager')) {
	// get the sysID of the parent software model from the URL
	var record = new GlideRecord('cmdb_software_product_model');
	record.get(RP.getParameterValue('sysparm_collectionID'));

	// get product reference if SAMS is enabled
	var productStr;
	if (GlidePluginManager.isActive('com.snc.sams')) {
		productStr = 'norm_product=' + record.getValue('product');
	} else {
		productStr = 'product_name=' + record.getValue('name');
	}

	var parmStr = productStr +
		'^publisher=' + record.getValue('manufacturer') +
		'^norm_version=' + record.getValue('version') +
		'^norm_edition=' + record.getValue('edition') +
		'^source=internal' +
		'^lifecycle_type=internal';

	action.setRedirectURL('sam_custom_sw_product_lifecycle.do?sys_id=-1&sysparm_query=' + parmStr);
	action.setNoPop(true);
} else {
	action.setRedirectURL('sam_custom_sw_product_lifecycle.do?');
	action.setNoPop(true);
}
