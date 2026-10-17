
(function() {
    try {
		var newCustomer = isNewCustomer();
		var setDefaultPriority = gs.getProperty("evt_mgmt.set_default_priority_group_for_alert_enabled", "false") === "true";
		var defaultPriorityGroup = gs.getProperty("evt_mgmt.default_priority_group", "5");

		var grDict = new GlideRecord('sys_dictionary');
		grDict.addQuery('name', 'em_alert'); 
		grDict.addQuery('element', 'sn_priority_group');
		grDict.query();

		gs.info("EM - Set default priority group : Begin setting default priority group for alerts");

		//zboot customer, for zboot customer we set the default priority group to a non empty value
		if(newCustomer || setDefaultPriority){
			gs.info("EM - Set default priority group : attempting to set default priority group to " + defaultPriorityGroup);
			if (grDict.next()) {
				grDict.setValue("default_value", defaultPriorityGroup);
				if(grDict.update()){
					gs.info('EM - Set default priority group : Successfully updated default value for priorty group to ' + defaultPriorityGroup);
				} else {
					gs.error('EM - Set default priority group : failed to update default priority group to ' + defaultPriorityGroup);
				}
				
			} else {
				gs.info('EM - Set default priority group : Could not find the specified dictionary entry');
			}
		//existing customer, for those we set the default priority group to empty
		} else {
			gs.info("EM - Set default priority group : attempting to set default priority group to empty");
			if (grDict.next()) {
				grDict.setValue("default_value", "NULL");
				if(grDict.update()){
					gs.info('EM - Set default priority group : Successfully updated default value for priorty group to empty value');
				} else {
					gs.error('EM - Set default priority group : failed to update default priority group to empty ');
				}
			} else {
				gs.info('EM - Set default priority group : Could not find the specified dictionary entry to set to empty value');
			}
		}
        
    } catch (ex) {
        gs.error('EM - Set default priority group : An error occurred while attempting to set the default priority group for alerts');
    }

	gs.info("EM - Set default priority group : Finish setting default priority group for alerts");
	
})();

function isNewCustomer(){
	var gr = new GlideRecord("em_alert");
	gr.addQuery();
	gr.setLimit(10);
	gr.query();

	return gr.getRowCount() < 10;
}
