var caller = gs.getUserID();
var parent_table = RP.getParameterValue('sysparm_parent_table');
if (JSUtil.notNil(parent_table)) {
	var parent_map = new GlideRecord('request_parent_mapping');
	parent_map.addQuery('parent_table', parent_table);
	parent_map.query();
	if (parent_map.next())
		var requested_for_field = parent_map.getValue('requested_for_field');
	var parentGR = new GlideRecord(parent_table);
	parentGR.addQuery('sys_id', RP.getParameterValue('sysparm_parent_sys_id'));
	parentGR.query();
	if (parentGR.next())
		caller = parentGR.getValue(requested_for_field);
}
current.contact_type = 'virtual_agent';
current.caller_id = caller;
if (producer.comments.length > 80)
	current.short_description = producer.comments.substring(0, 79);
else
	current.short_description = producer.comments;
current.description = producer.comments;

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
