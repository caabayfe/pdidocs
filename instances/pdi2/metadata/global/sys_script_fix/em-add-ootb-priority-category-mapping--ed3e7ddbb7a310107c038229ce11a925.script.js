populateCategoryMappingTable();


function populateCategoryMappingTable() {
    var severityCatgeory = "cca1945f936732000238f179077ffb0f";
    var roleCatgeory = "b9a1945f936732000238f179077ffb16";
    var stateCategory = "d1639e03533332000238ddeeff7b12a8";
    var servicesCategory = "f511d05f936732000238f179077ffb7a";
    var value = "";
    var sysId = "";

    var grMapping = new GlideRecord("em_alert_priority_category_mapping");
    grMapping.query();
    if (grMapping.next()) {
        // Quebec presented a new role for alerts that is called "Both". 
        // On upgrade - if 'em_alert_priority_category_mapping' exists then add the new role
        gs.log("Existing 'EM - Add OOTB priority category mapping' fix script. Updating roles (correlation groups) only.");

        // The following function will NOT execute on every run, 
        // but only in certain condition (if there are only 3 roles instead of 4)
        updateCorrelationGroups(roleCatgeory);

        return;
    }

    var gr = new GlideRecord("sys_choice");
    gr.addQuery("name", "em_alert");
    gr.addQuery("element", "severity");
    gr.query();

    while (gr.next()) {
        value = gr.getValue("value");
        sysId = gr.getUniqueValue();

        if (value == "4") //warning
            addCategoryMapping(severityCatgeory, sysId, "1");
        else if (value == "3") //minor
            addCategoryMapping(severityCatgeory, sysId, "2");
        else if (value == "2") //major
            addCategoryMapping(severityCatgeory, sysId, "3");
        else if (value == "1") //critical
            addCategoryMapping(severityCatgeory, sysId, "4");

    }

    // Add correlation groups mappings
    addCorrelationGroups(roleCatgeory);

    gr = new GlideRecord("sys_choice");
    gr.addQuery("name", "em_alert");
    gr.addQuery("element", "state");
    gr.query();

    while (gr.next()) {
        value = gr.getValue("value");
        sysId = gr.getUniqueValue();

        if (value == "Open") //None
            addCategoryMapping(stateCategory, sysId, "1");
        else if (value == "Reopen") //primary
            addCategoryMapping(stateCategory, sysId, "3");
        else if (value == "Flapping") //secondary
            addCategoryMapping(stateCategory, sysId, "2");

    }

    gr = new GlideRecord("sys_choice");
    gr.addQuery("name", "cmdb_ci_service");
    gr.addQuery("element", "busines_criticality");
    gr.query();

    while (gr.next()) {
        value = gr.getValue("value");
        sysId = gr.getUniqueValue();

        if (value == "1 - most critical")
            addCategoryMapping(servicesCategory, sysId, "4");
        else if (value == "2 - somewhat critical")
            addCategoryMapping(servicesCategory, sysId, "3");
        else if (value == "3 - less critical")
            addCategoryMapping(servicesCategory, sysId, "2");
        else if (value == "4 - not critical")
            addCategoryMapping(servicesCategory, sysId, "1");

    }

    gs.log("Finish to run 'EM - Add OOTB priority category mapping' fix script.");

}

// Add correlation groups mappings
function addCorrelationGroups(roleCatgeory) {
    var sysId = '',
        value = '';

    gr = new GlideRecord("sys_choice");
    gr.addQuery("name", "em_alert");
    gr.addQuery("element", "correlation_group");
    gr.query();

    while (gr.next()) {
        value = gr.getValue("value");
        sysId = gr.getUniqueValue();

        if (value == "0") //None
            addCategoryMapping(roleCatgeory, sysId, "2");
        else if (value == "1") //primary
            addCategoryMapping(roleCatgeory, sysId, "4");
        else if (value == "3") //both primary and secondary
            addCategoryMapping(roleCatgeory, sysId, "3");
        else if (value == "2") //secondary
            addCategoryMapping(roleCatgeory, sysId, "1");
    }
}

// Remove all existing correlation groups mappings and create them again fully
function updateCorrelationGroups(roleCategory) {
    // Remove
    var grMapping = new GlideRecord("em_alert_priority_category_mapping");
    grMapping.addQuery('priority_category', roleCategory);
    grMapping.query();

    // From Quebec, expecting 4 roles (with 3 as Both, and 4 as Primary)
    // If there are less (like on upgrade from older versions) then update the roles (delete and add all roles)
	if (grMapping.getRowCount() === 3) {
		// Remove previous records and create new records instead with updated state
		gs.log('Event Management - EM - Removing ' + grMapping.getRowCount() + ' records of "role" priority category from "em_alert_priority_category_mapping"');
		grMapping.deleteMultiple();
		
		// Create
		addCorrelationGroups(roleCategory);
	}
}

function addCategoryMapping(category, choice, valueAfterMapping) {
    var gr = new GlideRecord("em_alert_priority_category_mapping");
    gr.setValue("choice", choice);
    gr.setValue("priority_category", category);
    gr.setValue("value", valueAfterMapping);
    gr.insert();
}
