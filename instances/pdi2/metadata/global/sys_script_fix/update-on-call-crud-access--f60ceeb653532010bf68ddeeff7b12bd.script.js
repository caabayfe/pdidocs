var onCallTables = [
	"cmn_rota",
	"cmn_rota_roster",
	"cmn_rota_member",
	"cmn_rota_contact_preference",
	"cmn_rota_escalation",
	"cmn_rota_escalation_set",
	"cmn_rota_esc_step_def",
	"cmn_rota_resp_cache",
	"on_call_communication_type",
	"on_call_escalation_comm",
	"on_call_escalation_con_attempt",
	"on_call_escalation_level",
	"on_call_escalation_response",
	"on_call_escalation",
	"on_call_group_preference",
	"on_call_user_contact_preference",
	"on_call_user_preference",
	"sys_on_call_contact_source",
	"sys_on_call_group_template",
	"sys_on_call_shift_template",
	"roster_schedule_span_proposal",
	"roster_schedule_span",
	"trigger_rule"
];

updateOnCallTables();

function updateOnCallTables() {
	
	if (pm.isZboot())
		return;
	
	var dbObjects = new GlideRecord('sys_db_object');
	dbObjects.addQuery('name', 'IN', onCallTables.join(','));
	dbObjects.setValue('read_access', true);
	dbObjects.setValue('update_access', true);
	dbObjects.setValue('create_access', true);
	dbObjects.setValue('delete_access', true);
	dbObjects.setValue('alter_access', true);
	dbObjects.setValue('actions_access', true);
	dbObjects.setValue('client_scripts_access', true);
	dbObjects.setValue('ws_access', true);
	
	dbObjects.setWorkflow(false);
	dbObjects.setUseEngine(false);
	dbObjects.updateMultiple();
}
