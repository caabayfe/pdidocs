/*
	Check whether or not we can unpublish the template.
*/
function transform(input) {
	var result = true;
	var templateSysId = input.templateSysId;

	/*
		Check if the template has been put in the running queue
		or is in running state
	*/
	var gr = new GlideRecord('reconcile_duplicate_template_run');
	gr.addQuery('template', templateSysId);
	gr.addEncodedQuery('stateINdraft,ready,running');
	gr.query();

	if (gr.getRowCount() > 0) {
		result = false;
	}
	return result;
}
