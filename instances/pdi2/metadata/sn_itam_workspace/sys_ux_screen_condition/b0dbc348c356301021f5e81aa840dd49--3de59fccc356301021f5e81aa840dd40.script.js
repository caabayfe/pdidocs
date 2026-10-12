(function suiteComponentFunction(params) {
	var table = params.data.table;
	var sysId = params.data.sysId;
	var isSmParentTable = false;
    var isNew = params.data.isNew;
	if (table === 'cmdb_software_product_model' && isNew === "false" ) {
		return true;
	} else {
		return false;
	}
})(inputProperties);
