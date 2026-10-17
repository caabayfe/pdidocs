queryForCatItemCategories();
function queryForCatItemCategories() {
   	lookup.addQuery('sc_catalog', 'IN', current.sc_catalogs);
	lookup.addQuery('sys_class_name','!=', 'sc_category_top_n');
	if(!gs.hasRole('catalog_admin') && (gs.hasRole('catalog_manager, catalog_editor')))
		lookup.addQuery('sc_catalog.manager',gs.getUserID()).addOrCondition('sc_catalog.editors','CONTAINS',gs.getUserID());
}
