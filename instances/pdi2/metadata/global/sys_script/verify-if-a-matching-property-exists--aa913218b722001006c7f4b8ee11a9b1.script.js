(function executeRule(current, previous /*null when async*/) {

        // Make sure that there is no existing property with the same name 
        if (current.property == null || current.property == '') {
                if (GlideProperties.get(current.name) != null) {
                        gs.addErrorMessage(gs.getMessage('Cannot create a new Application Property with the same name as an existing property without referencing it.'));
                        current.setAbortAction(true);
                }             
        } else {
			var prop = new GlideRecord('sys_properties');
			prop.get(current.property);
			if (prop.is_private == true) {
				gs.addErrorMessage(gs.getMessage('Cannot create a new Application Property from a private System Property'));
				current.setAbortAction(true);
			}	
		}

})(current, previous);
