var collectionId = "";
try {
	if(gs.isInteractive()){
		collectionId = gs.action.getGlideURI().get('sysparm_collection');
	}
} catch (err) {
	gs.debug("[Maintain Catalog Category M2M Items]: Error reading sysparm_collection");
}
if (collectionId != "sc_category") {
	GlideappCatalogItem.updateCategory(previous, current);
	var item = GlideappCatalogItem.get(current.sys_id);
	if (item != null)
		item.checkCategories();
}
