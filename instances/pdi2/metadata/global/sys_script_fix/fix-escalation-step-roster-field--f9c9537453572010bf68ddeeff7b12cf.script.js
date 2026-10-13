var SCRIPT_NAME = 'fix_esc_step_rosters_field: ';
function processFixScript() {
	if (pm.isZboot())
		return;
	
	gs.log(SCRIPT_NAME + 'Started updating cmn_rota_roster field type to List');

	var escStepGr = new GlideRecord('cmn_rota_esc_step_def');
	escStepGr.addEncodedQuery('cmn_rota_rosterISNOTEMPTY');
	escStepGr.query();
	while (escStepGr.next()) {
		if (escStepGr.isValidField('cmn_rota_rosters')) {
			escStepGr.cmn_rota_rosters = escStepGr.cmn_rota_roster + '';
			escStepGr.setWorkflow(false);
			escStepGr.setUseEngine(false);
			escStepGr.update();
		} else
			gs.log(SCRIPT_NAME + 'cmn_rota_rosters is not a valid field on ' + escStepGr.getUniqueValue());
	}

	var dictionaryGr = new GlideRecord('sys_dictionary');
	dictionaryGr.addQuery('name', 'cmn_rota_escalation_set');
	dictionaryGr.addQuery('element', 'cmn_rota');
	dictionaryGr.addQuery('mandatory', true);
	dictionaryGr.setLimit(1);
	dictionaryGr.query();

	if (dictionaryGr.next()) {
		dictionaryGr.setValue('mandatory', false);
		dictionaryGr.update();
	}
}

try {
	processFixScript();
} catch(err) {
	gs.error(SCRIPT_NAME + err);
} finally {
	gs.log(SCRIPT_NAME + 'Finished updating cmn_rota_roster field type to List');
}
