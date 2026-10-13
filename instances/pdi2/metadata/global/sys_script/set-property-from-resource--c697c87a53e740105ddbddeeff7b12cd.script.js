(function executeRule(current, previous /*null when async*/) {

	var hasNext,
		queryFrom = (current.operation() == 'insert' ? current : previous),
		gr = new GlideRecord('ecc_agent_property');

	gr.addQuery('name', 'mid.limited.resource.' + queryFrom.resource.name);
	gr.addQuery('ecc_agent', queryFrom.ecc_agent)
	gr.query();
	hasNext = gr.hasNext();
	gr.next();

	if (current.operation() == 'delete') {
		if (hasNext)
			gr.deleteRecord();

		return;
	}

	gr.name = 'mid.limited.resource.' + current.resource.name;
	gr.ecc_agent = current.ecc_agent;
	gr.value = current.available;
	if (current.order != null)
		gr.value += ':' + current.order;

	gr.setWorkflow(false);
	gr.update();

})(current, previous);
