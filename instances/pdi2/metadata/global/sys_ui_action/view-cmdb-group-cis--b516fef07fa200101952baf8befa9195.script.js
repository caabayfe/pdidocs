function viewCMDBGroup() {
    var url = generateUrl();
    window.open(url);
}

/**
 * Generates a URL for the CMDB group show all CI page
 * @returns {string} 
 */
function generateUrl() {
    var AND = "&";
    var url = "/$cmdb_group_show_all_ci.do?sysparm_collection=cmdb_group";
	var cmdbGroup = g_form.hasField('cmdb_group') ? g_form.getValue('cmdb_group') : getCmdbGroup(g_form.getUniqueValue());
    url += (AND + "sysparm_collectionID=" + cmdbGroup);
    url += (AND + "sysparm_stack=no");
    url += (AND + "sysparm_collectionType=manualGroup");

    return url;
}

/**
 * Retrieves the CMDB group value for the current record
 * @returns {string}
 */
function getCmdbGroup(serviceId){
	var grQueryBasedService = new GlideRecord('cmdb_ci_query_based_service');
	grQueryBasedService.get(serviceId);
	return grQueryBasedService.getValue('cmdb_group');
}
