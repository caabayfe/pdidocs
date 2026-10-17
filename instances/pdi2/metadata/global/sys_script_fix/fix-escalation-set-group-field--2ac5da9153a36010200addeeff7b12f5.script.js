var SCRIPT_NAME = 'fix_cmn_rota_escalation_set_group_field: ';
function processFixScript() {
	if (pm.isZboot())
		return;

	gs.log(SCRIPT_NAME + 'Started populating group field for escalation sets');

	var escSetGr = new GlideRecord('cmn_rota_escalation_set');
	if (!escSetGr.isValidField('group')) {
		gs.log(SCRIPT_NAME + 'group column is invalid in cmn_rota_escalation_set');
		return;
	}

	var dictionaryGr = new GlideRecord('sys_dictionary');
	dictionaryGr.addQuery('name', 'cmn_rota_escalation_set');
	dictionaryGr.addQuery('internal_type', 'collection');
	dictionaryGr.setLimit(1);
	dictionaryGr.query();

	if (dictionaryGr.next()) {
		var gAttr = new GlideAttributes(dictionaryGr.getValue('attributes'));
		gAttr.setAttribute('domain_master', 'group');
		dictionaryGr.setValue('attributes', gAttr.serializeAttributes());
		dictionaryGr.update();
	}

	var contactPrefDictionaryGr = new GlideRecord('sys_dictionary');
	contactPrefDictionaryGr.addQuery('name', 'cmn_rota_contact_preference');
	contactPrefDictionaryGr.addQuery('internal_type', 'collection');
	contactPrefDictionaryGr.setLimit(1);
	contactPrefDictionaryGr.query();

	if (contactPrefDictionaryGr.next()) {
		var attributes = new GlideAttributes(contactPrefDictionaryGr.getValue('attributes'));
		attributes.setAttribute('domain_master', 'cmn_rota_escalation_set');
		contactPrefDictionaryGr.setValue('attributes', attributes.serializeAttributes());
		contactPrefDictionaryGr.update();
	}
	
	var escSetGr = new GlideRecord('cmn_rota_escalation_set');
	escSetGr.initialize();
	escSetGr.addNotNullQuery('cmn_rota');
	escSetGr.query();

	while (escSetGr.next()) {
		var groupId = escSetGr.cmn_rota.group + '';
		if (groupId && escSetGr.isValidField('group')) {
			escSetGr.group = groupId;
			escSetGr.setWorkflow(false);
			escSetGr.update();
		} else
			gs.log(SCRIPT_NAME + 'group column is not a valid field on ' + escSetGr.getUniqueValue());
	}
}

try {
	processFixScript();
} catch (err) {
	gs.error(SCRIPT_NAME + err);
} finally {
	gs.log(SCRIPT_NAME + 'Finished populating group field for escalation sets');
}
