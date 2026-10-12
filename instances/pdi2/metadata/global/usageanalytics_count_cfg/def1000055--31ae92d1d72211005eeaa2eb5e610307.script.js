
answer = getCIsManagedByConfigAuto();

/*
* Count the number of managed CIs
* only if the plugin is installed (otherwise the fields don't exist)
*/
function getCIsManagedByConfigAuto() {
    var managedItems = 0;
    if (pm.isActive('com.snc.configuration_automation')) {
    	if (!GlideTableDescriptor.isValid('cmdb_ci_computer') )
			return managedItems;
        var gr = new GlideAggregate('cmdb_ci_computer');
        gr.addEncodedQuery('cfg_auto_providerISNOTEMPTY');
        gr.addAggregate('COUNT');
        gr.query();

        if (gr.next()) {
            managedItems = gr.getAggregate('COUNT');
        }
    }
    return managedItems;
}
