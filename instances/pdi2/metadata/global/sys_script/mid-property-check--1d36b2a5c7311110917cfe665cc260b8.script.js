(function executeRule(current, previous /* null when async */ ) {
	validatePropertyValue();
	checkDuplicateProperty();
	
	function validatePropertyValue() {
		// If any field other than value is updated no need to validate the property value
		if (current.operation() == 'update' && !current.value.changes())
			return;
		
		// Value cannot be empty or null
		if (current.value == null || current.value == "") {
			gs.addErrorMessage(gs.getMessage("Value cannot be empty or null."));
			current.setAbortAction(true);
		}
		
		// *** Validate property value if property is a known non-legacy MIDConfigParameter name
		var mcp = SncMIDConfigParameter;
		var param = mcp.byName(current.name);
		if (param) {
			try {
				param.parseAndValidateValue(current.value); // Ignore return value, throws exception if value is invalid
			} catch (e) {
				var valMsg = gs.getMessage("Invalid value: {0}", e.getMessage() != null ? e.getMessage() + '' : e + '');
				gs.addErrorMessage(valMsg);
				current.setAbortAction(true);
			}
		}
	}

	function checkDuplicateProperty() {
		// *** Check for duplicate property record in all visible domains
	
		// No need to check for the duplicate record if the updated field is not property name or MID Server or the domain
		if (current.operation() == 'update' && 
				!(current.name.changes() || current.ecc_agent.changes() || current.sys_domain.changes()))
			return;
		
		var isDomainSeparated = gs.getProperty("glide.sys.domain.use_record_domain_for_processes") == 'true';
		var gr = new GlideRecord('ecc_agent_property');
		gr.addQuery('name', current.name);
		gr.addQuery('ecc_agent', current.ecc_agent);
		if (isDomainSeparated) {

			// Since we cannot have addQuery for domain, and we query based on the name and assigned Mid Server
			// If we update the record and we only change the domain, the updated record is in the result of 
			// query and we need to exclude it
			if (current.operation() == 'update' && current.sys_domain.changes()) {
				gr.addQuery('sys_id', '!=', current.sys_id + '');
			}

			// Make sure we don't count the override record as duplicate
			// Since the business rule is running before insert/update, the override record is still visible
			// After inserting the record with 'sys_overrides, the parent record is not visible to child domain
			if(current.sys_overrides) {
				gr.addQuery('sys_id', '!=', current.sys_overrides + '');
			}
			gr.addDomainQuery(current.sys_domain + '');
			
		}
		gr.query();
		
		if (!gr.hasNext())
			return;

		gs.addErrorMessage(gs.getMessage('Cannot create a duplicate MID server property record'));
		if (isDomainSeparated) {
			gs.warning('Check for duplicate name + ecc_agent in all accessible domains on ecc_agent_property found duplicate record');
		} else {
			gs.warning('Check for duplicate name + ecc_agent on ecc_agent_property found duplicate record');
		}
		current.setAbortAction(true);
	}

}(current, previous));
