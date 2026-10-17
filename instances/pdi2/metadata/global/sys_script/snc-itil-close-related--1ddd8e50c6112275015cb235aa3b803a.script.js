//
// Close any tasks that are related to the current task
//
function closeRelatedTasks(me) {
	var task = new GlideRecord("task");
	task.addQuery("parent", me.sys_id);
	task.addQuery("sys_class_name", "!=", "kb_submission");
	task.addQuery("sys_class_name", "!=", "incident");
	task.query();
	while (task.next()) {
		if (task.sys_class_name == 'problem')
			closeProblem(task.sys_id, me.number);
		else if (task.sys_class_name == 'change_request')
			closeChange(task.sys_id, me.number);
		else {
			task.active.setValue(false);
			task.update();
			gs.print("Task " + task.number + ' closed based on closure of task ' + me.number);
		}
	}
	
	this.closeIncident(me);
}

function closeIncident(me) {
	var incident = new GlideRecord('incident');
	if (incident.isValidField('parent_incident'))
		incident.addQuery('parent_incident', me.sys_id);
	else if(incident.isValidField('parent'))
			incident.addQuery('parent', me.sys_id);
		else
			return;
	incident.addActiveQuery();
	incident.query();
	while (incident.next()) {
		var msg = gs.getMessage("Incident '{0}' closed based on closure of task '{1}'", [incident.number, me.number]);
		gs.print(msg);
		incident.incident_state.setValue(IncidentState.CLOSED);
		incident.active.setValue(false);
		incident.comments = msg;
		if (incident.isValidField("close_notes")) {
			var notes = incident.close_notes.getDisplayValue();
			notes = notes + '\n' + msg + '\n\n' + me.close_notes;
			incident.close_notes.setValue(notes);
		}
		if(incident.isValidField("close_code"))
			incident.close_code.setValue(me.close_code);
		incident.update();
	}
}

function closeProblem(myID, fromNumber) {
	if (pm.isActive('com.snc.best_practice.problem.madrid.state_model'))
		return;
	var problem = new GlideRecord('problem');
	if (problem.get('sys_id', myID)) {
		var msg = gs.getMessage("Problem '{0}' closed based on closure of task '{1}'", [problem.number, fromNumber]);
		problem.problem_state.setValue(4);
		var notes = problem.close_notes.getDisplayValue();
		notes = notes + '\n' + msg;
		problem.close_notes.setValue(notes);
		problem.update();
		gs.print(msg);
	}
}

function closeChange(myID, fromNumber) {
	var rfc = new GlideRecord('change_request');
	if (rfc.get('sys_id', myID)) {
		var chgReq = ChangeRequest(rfc);
		
		if (!chgReq.isClosed() && !chgReq.isCancelled()) {
			chgReq.close();
			var msg = gs.getMessage("Change '{0}' closed based on closure of task '{1}'", [rfc.number, fromNumber]);
			var notes = rfc.close_notes.getDisplayValue();
			notes = notes + '\n' + msg;
			rfc.close_notes = notes;
			rfc.update();
		}
	}
}
