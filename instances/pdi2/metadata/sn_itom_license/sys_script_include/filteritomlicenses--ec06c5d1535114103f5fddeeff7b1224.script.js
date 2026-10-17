function FilterITOMLicenses(skuType) {
	var licenseDedupe = {};
	var licenseSysIds = [];
	
	var licenseUtil = new sn_itom_license.ITOMLicensingUtils();
	var gr = new GlideRecordSecure('license_itom_ci_su_ratio');
	var bundleGr = gr.addJoinQuery('itom_lu_bundle_mappings', 'app_bundle', 'bundle_id');
  bundleGr.addCondition('sku', licenseUtil.skuSysId[skuType]);
	gr.query();
	
	while(gr.next()) {
		var licenseSysId = gr.getValue('license') + '';
		if(!licenseDedupe[licenseSysId]) {
			licenseSysIds.push(licenseSysId);
			licenseDedupe[licenseSysId] = true;
		}
	}	

	return licenseSysIds;
}
