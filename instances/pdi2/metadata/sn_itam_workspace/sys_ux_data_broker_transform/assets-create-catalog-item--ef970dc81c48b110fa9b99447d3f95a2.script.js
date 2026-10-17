function transform(input) {
    var mSysId = input.mSysId;
    var catSysId = input.catSysId;
	var table = input.table;
    var type = '';

	if(table === 'cmdb_hardware_product_model' || table === 'cmdb_consumable_product_model') {
		type = 'pc_hardware_cat_item';
	} else if(table === 'cmdb_software_product_model') {
		type = 'pc_software_cat_item';
	} else {
		type = 'pc_product_cat_item';
	}
	var gr = new GlideRecord('cmdb_model');
	/*
	* To prevent multiple catalog items from being created
	* when the same Publish UI action is executed more than once
	*/
	if(gr.get(mSysId) && gs.nil(gr.product_catalog_item)) {
		gr.product_catalog_item = (new global.ProductCatalogUtils()).createProductCatalog(gr, catSysId, 'model', type);
		var sysId = gr.product_catalog_item;
		gr.update();
		// Add location variable to the hardware catalog item published if HAM is active and indoor mapping is enabled
		if (type === 'pc_hardware_cat_item' && GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMRitmUtils.prototype.addLocationVariable) {
			new sn_hamp.HAMRitmUtils().addLocationVariable(sysId);
		}
	}
	return;
}
