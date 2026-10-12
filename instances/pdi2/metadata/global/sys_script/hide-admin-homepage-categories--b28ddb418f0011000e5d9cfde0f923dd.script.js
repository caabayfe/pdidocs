hideAdminHomeItems();
function hideAdminHomeItems() {
    if (!isUITransaction())
		return;

    current.addNullQuery('sc_catalog').addOrCondition("sc_catalog", "!=", "0b22fd2ad7021100b9a5c7400e610319");

}

function isUITransaction () {
	var transaction = GlideTransaction.get();
    if (!transaction)
        return false;

    var page = transaction.getPageName();
    
    if (!page)
        return false;

    if (page != "sc_category_list" && page != "xmlhttp" && page != "angular" && page != "com.glideapp.servicecatalog_cat_item_view" && page.indexOf('api/now/') == -1) 
        return false;
	
	return true;
}
