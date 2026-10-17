function onClick(g_form) {
	var result = g_form.save();
	if (!result) {
		//failed form submission
		return;
	}
	
	result.then(function() {
		var ga = new GlideAjax('global.StdChangeUtils');
		ga.addParam('sysparm_name', 'ajaxFunction_getCategory');
		ga.getXMLAnswer(function (answer) {
			if (answer) {
				var params = {};
				params.sysparm_parent_table = "interaction";
				params.sysparm_parent_sys_id = g_form.getUniqueValue();
				params.table = 'sc_category';
				params.sysId = answer; //Standard Change Category
				g_service_catalog.openCatalogItem('sc_cat_item', '-1', params);
			}
		});
		
	});
}
