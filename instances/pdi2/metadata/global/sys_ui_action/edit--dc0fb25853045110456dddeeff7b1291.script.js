var uri = action.getGlideURI();
var path = uri.getFileFromPath();
var policyId = parent.getValue('policy_id');

uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');

if (!JSUtil.nil(policyId) && parent.getTableName() === 'cmdb_data_management_task') {
	var gr = new GlideRecord('cmdb_data_management_policy');
	gr.get(policyId);
	var deleteRelatedEntryPolicyId = 'c3059c79ff920110456d766cf43bf1c6';
	if (gr.getValue('cmdb_policy_type') === deleteRelatedEntryPolicyId)
		uri.set('sysparm_query', 'roles=data_manager_admin^ORroles=data_manager_user');
	else
		uri.set('sysparm_query', '');
	action.setRedirectURL(uri.toString('sys_m2m_template.do'));
} else {
	uri.set('sysparm_query', '');
	action.setRedirectURL(uri.toString('sys_m2m_template.do'));
}
