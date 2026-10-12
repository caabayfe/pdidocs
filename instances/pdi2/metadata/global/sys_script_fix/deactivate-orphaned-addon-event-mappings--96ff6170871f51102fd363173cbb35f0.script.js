function deactivateEventMappingRecord(addOnEventMappings){
	addOnEventMappings.active = false;
	addOnEventMappings.update();
}

// Looks for records that have no macroponent associated (orphaned)
var addOnEventMappings = new GlideRecord('sys_ux_addon_event_mapping');
addOnEventMappings.addQuery('parent_macroponent.name', null).addOrCondition('parent_macroponent', '');
addOnEventMappings.addQuery('controller', '');
addOnEventMappings.addQuery('active', true);
addOnEventMappings.query();
while(addOnEventMappings.next()){
	var parentMacroponent = new GlideRecord('sys_ux_macroponent');
	if(!parentMacroponent.get(addOnEventMappings.parent_macroponent.sys_id.toString())){
		deactivateEventMappingRecord(addOnEventMappings);
	}
}

// Check all records that don't have a source or target event associated or the MCP doesn't have a parent screen (unused)
addOnEventMappings = new GlideRecord('sys_ux_addon_event_mapping');
addOnEventMappings.addQuery('active', true);
addOnEventMappings.query();
while(addOnEventMappings.next()){
	// First we check if it is missing either the source_da or target_event fields because then it's unused
	if(addOnEventMappings.source_da.nil() || addOnEventMappings.target_event.nil()){
		deactivateEventMappingRecord(addOnEventMappings);
		continue;
	}
	// Next we check if the parent MCP doesn't have a parent screen, meaning the screen was deleted and the MCP is an orphan
	var parentMacroponent = new GlideRecord('sys_ux_macroponent');
	if(parentMacroponent.get(addOnEventMappings.parent_macroponent.sys_id.toString())){
		var parentScreen = new GlideRecord('sys_ux_screen');
		if(!parentScreen.get('macroponent', parentMacroponent.sys_id.toString())){
			deactivateEventMappingRecord(addOnEventMappings);
		}
	}
}
