(function executeRule(current, previous /*null when async*/) {
	/* PRB1250902
     * This business rule cascades wf_context deletions to the wf_workflow_binding table.
	 * This business rule does not get executed when the table cleaner on wf_context removes
	 * the wf_context record, there by maintaining the promise not to re-start workflows on old
	 * records.
	 */

	var binding = new GlideRecord('wf_workflow_binding');
	binding.addQuery('id', current.getValue("id"));
	binding.addQuery('workflow_version', current.getValue("workflow_version"));
	binding.deleteMultiple();

})(current, previous);
