gs.log('Setting "replace_on_upgrade" in the sys_update_xml record for the "Encrypt SSH private key" business rule'); 
// The hash codes of the script and the condition of the old version of the business rule
var OLD_SCRIPT_HASH_CODE = -2136766200;
var OLD_CONDITION_HASH_CODE = 1067958605;

// Step 1: Ensure the business rule is active and its script and condition match the old business rule
var gr = new GlideRecord("sys_script");
gr.addQuery("name", "Encrypt ssh private key");
gr.addQuery("active", true);
gr.query();
var currentScriptHashCode = 0;
var currentConditionHashCode = 0;
if (gr.next()) {
	currentScriptHashCode = hashCode(gr.getValue("script"));
	currentConditionHashCode = hashCode(gr.getValue("condition"));
}

// Step 2: If the business rule was not upgraded, query the sys_update_xml table for a record 
// for the business rule with replace_on_upgrade set to false. Find the most recently created record.
if (currentScriptHashCode == OLD_SCRIPT_HASH_CODE && currentConditionHashCode == OLD_CONDITION_HASH_CODE) {
	var updateGr = new GlideRecord("sys_update_xml");
	updateGr.addQuery("target_name", "Encrypt ssh private key");
	updateGr.addQuery("type", "Business Rule");
	updateGr.addQuery("replace_on_upgrade", false);
	updateGr.orderByDesc("sys_created_on");
	updateGr.setLimit(1);
	updateGr.query();
}

// Step3: set replace_on_upgrade to true
if (updateGr && updateGr.next()) {
    var before = gs.getSession().getWorkflow();
    gs.getSession().setWorkflow(false);
    updateGr.setValue("replace_on_upgrade", true);
    updateGr.update();
    gs.getSession().setWorkflow(before);
    gs.log('"replace_on_upgrade" was set to true for the "Encrypt ssh private key" business rule record in the "sys_udpate_xmL" table');
}
    	
// A method to calculate the hashCode of the input string. 
function hashCode(str) {
	var hash = 0;

    if (!str || str.length === 0) {
		return hash;
	}
    for (var i = 0; i < str.length; i++) {
		var hCode = str.charCodeAt(i);
		hash = (hash << 5) - hash + hCode;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}
