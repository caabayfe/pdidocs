updateChildIncidents();

function updateChildIncidents() {
	if (current.state.changesTo(IncidentState.RESOLVED))
		resolveChildIncidents();
	else {
		var value;
		
		if (current.comments.changes()) {
			value = deriveFieldValue('comments', gs.getMessage('Comment copied from Parent Incident'));
			
			if (value && value != "")
				executeFlowAction(current, 'comments', value);
		}
		
		if (current.work_notes.changes()) {
			value = deriveFieldValue('work_notes', gs.getMessage('Work note copied from Parent Incident'));
			
			if (value && value != "")
				executeFlowAction(current, 'work_notes', value);
		}
		
	}
}

function executeFlowAction (parentIncidentGr, fieldName, value) {
	
	try {
		var inputs = {};
		inputs['field'] = fieldName; // String 
		inputs['value'] = value; // String 
		inputs['parent_incident_gr'] = parentIncidentGr; // GlideRecord of table: incident
		inputs['state_changes'] = current.state.changes();
		sn_fd.FlowAPI.getRunner().action('global.update_child_incidents').inBackground().withInputs(inputs).run();
					
	} catch (ex) {
		var message = ex.message;
		gs.error("Error while updating parent incident {0}, Error: {1}", [parentIncidentGr.getDisplayValue(), message]);
	}
	
}

function deriveFieldValue(fieldName, msg) {
	
	var fieldRawValue = current.getValue(fieldName) + '';
	var fieldValue = fieldRawValue.trim();
	
	if (fieldValue && fieldValue.length > 0) {
		
		if (fieldRawValue.indexOf(msg) == 0)
			return (fieldRawValue);
		else
			return (msg + ": " + fieldRawValue);
	}
	
	return;
}

//
// Resolve active, unresolved incidents that are children of the current incident
//
function resolveChildIncidents() {
    //check if update is valid or aborted before updating child incidents
	if(current.isActionAborted())
		return;

	var incident = new GlideRecord("incident");
	incident.addActiveQuery();
	incident.addQuery("parent_incident", current.sys_id);
	incident.addQuery("state", "!=", IncidentState.RESOLVED);
	incident.query();
	var msg = "";
	while (incident.next()) {
		gs.print("Incident " + incident.number + ' resolved based on resolution of Parent Incident ' + current.number);
		incident.state = IncidentState.RESOLVED;
		if (incident.isValidField("close_notes") && incident.close_notes.nil()) {
			msg = gs.getMessage('{0} copied from Parent Incident', current.close_notes.getLabel());
			if (current.close_notes.toString().indexOf(msg) == 0)
				incident.close_notes = current.close_notes;
			else
				incident.close_notes = msg + ": " + current.close_notes;
		}
		if(incident.isValidField("close_code"))
			incident.close_code = current.close_code;
		msg = gs.getMessage("Resolved based on resolution of Parent Incident.");
		if (current.comments.toString().indexOf(msg) == 0)
			incident.comments = current.comments;
		else
			incident.comments = msg + " " + current.comments;
		incident.work_notes = current.work_notes;
		incident.update();
	}
}
