(function executeRule(current, previous) {

	var gr = new GlideRecord('ecc_agent_property');

	gr.setWorkflow(false);
	gr.addQuery('name', 'mid.limited.resource.' + previous.name);
	gr.query();
	gr.name = 'mid.limited.resource.' + current.name;
	gr.updateMultiple();

})(current, previous);
