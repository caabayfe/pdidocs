var gr = new GlideRecord('wf_estimated_runtime_config');
gr.addQuery('workflow_version',current.sys_id);
gr.query();

if (!gr.next())
{
	var newRec = new GlideRecord('wf_estimated_runtime_config');
	newRec.initialize();
	newRec.workflow_version =  current.sys_id;
	newRec.percentage_threshold_ert = 20;
	newRec.insert();
}
