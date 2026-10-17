(function() {
	var p = {};
	p = options;
	var sys_id = $sp.getParameter('sys_id');
	sys_id = gs.nil(sys_id) ? '' : sys_id;

	var isPluginActive = new GlidePluginManager().isActive('com.sn_hr_core');

	if (isPluginActive && isHRCatalogItem(sys_id)) // redirect to HR ticket page if catalog item is of HR
		p.page = options.hr_page;

	data.catalogItem = $sp.getWidget('widget-sc-cat-item-v2', p);

	function isHRCatalogItem(catalogItemId) {
		var table_extensions = sn_hr_core.hr.TABLE_CASE_EXTENSIONS;
		var gr = new GlideRecord('sc_cat_item_producer');
		if (catalogItemId != '' && gr.canRead() && gr.get('sys_id', catalogItemId)) {
			var tableName = gr.getValue('table_name');
			if (table_extensions.indexOf(tableName) != -1)
				return true;
		}
		return false;
	}
})();
