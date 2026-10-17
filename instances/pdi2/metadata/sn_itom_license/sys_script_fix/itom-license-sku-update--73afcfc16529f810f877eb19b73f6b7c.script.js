// Adding ITOM as a Default value
var tableName = ['itom_lu_ci_counts', 'itom_lu_licensable_cis'];
var skuColName = "sku";
var itomSysId = new sn_itom_license.ITOMLicensingUtils().skuSysId['itom'];
tableName.forEach(function(tName) {
	if(new global.UtilScript().getTableUtil(tName).isValidField(skuColName)) {
		var gr = new GlideRecord(tName);
		gr.addNullQuery(skuColName);
		gr.setValue(skuColName,itomSysId);
		if(gr.updateMultiple())
			gs.info('ITOM License '+ tName +' records updated successfully with SKU Type');
	}
});
