function transform(input) {
	
    var adminCloneUtil = new AdminCloneUtil();
    var breadCrumbsData = [];
    if (input.table_name) {
        try {
            breadCrumbsData = adminCloneUtil.getBreadCrumbsByPageParams(input.table_name);
        } catch (e) {
            gs.error("Unable to fetch breadcrumbs data: " + e.toString());
            return breadCrumbsData;
        }
    }
    return {
        "breadCrumbsData": breadCrumbsData,
    };
}
