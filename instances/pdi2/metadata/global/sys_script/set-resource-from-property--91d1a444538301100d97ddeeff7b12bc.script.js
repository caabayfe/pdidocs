(function executeRule(current, previous /*null when async*/) {

	var newName, resourceGr,
		queryFrom = (current.operation() == 'insert' ? current : previous),
		previousName = queryFrom.name,
		value = current.value.split(':'),
		gr = new GlideRecord('mid_resource');

	previousName = previousName.split('mid.limited.resource.')[1];

	newName = current.name.split('mid.limited.resource.');
	if (newName.length != 2 || newName[0] || !newName[1]) {
		current.setAbortAction(true);
		return;
	}
	newName = newName.pop();

	gr.setWorkflow(false);
	gr.addQuery('resource.name', previousName);
	gr.addQuery('ecc_agent', queryFrom.ecc_agent + '');
	gr.query();
	if (!gr.next()) {
		if (current.operation() != 'delete')
			gs.addErrorMessage(gs.getMessage('Corresponding resource not found.  Please add a matching "MID Resource" record.'));
		return;
	}
	if (current.operation() == 'delete') {
		gr.deleteRecord();
		return;
	}

	gr.available = value[0];
	gr.order = value[1];
	gr.ecc_agent = current.ecc_agent;
	gr.update();

	if (previousName != newName) {
		resourceGr = new GlideRecord('mid_limited_resource');
		resourceGr.setWorkflow(false);
		if (!resourceGr.get('sys_id', gr.resource)) {
			gs.addErrorMessage(gs.getMessage('Unable to get resource.  Resource name won\'t be updated.'));
			return;
		}
		resourceGr.name = newName;
		resourceGr.update();
	}
})(current, previous);
