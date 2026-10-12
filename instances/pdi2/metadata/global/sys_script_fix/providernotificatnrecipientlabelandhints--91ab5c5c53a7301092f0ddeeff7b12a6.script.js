updateEventRelatedLabelAndHints();
function updateEventRelatedLabelAndHints () {
	if (pm.isZboot())
		return;
	updateEventParm1Label();
	updateEventParm2Label();
	updateEventParm1TableLabel();
	updateEventParm1TableHint();
	updateEventParm2TableLabel();
	updateEventParm2TableHint();
	updateUsersHint();
	updateRecipientsInFieldsLabel();
	updateRecipientsInFieldsHint();
}

function updateEventParm1Label(){
	var newlabel = gs.getMessage('Recipient(s) listed in event parm1 (Learn more)');
	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element','event_parm_1');
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setValue('hint','');
		grUpdate.setValue('url','https://docs.servicenow.com/bundle/rome-platform-administration/page/administer/platform-events/concept/events.html');
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element','event_parm_1');
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

function updateEventParm2Label(){
	var newlabel = gs.getMessage('Recipient(s) listed in event parm2');
	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element','event_parm_2');
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setValue('hint','');
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element','event_parm_2');
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

function updateEventParm1TableLabel(){
	var newlabel = gs.getMessage('Table containing recipients from event parm1');
	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element','event_parm_1_table');
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element','event_parm_1_table');
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

function updateEventParm2TableLabel(){
	var newlabel = gs.getMessage('Table containing recipients from event parm2');
	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element','event_parm_2_table');
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element','event_parm_2_table');
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

 function updateEventParm1TableHint(){
	var newHint = gs.getMessage('Choose the table that contains the recipients listed in event parm1');
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','event_parm_1_table');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}

function updateEventParm2TableHint(){
	var newHint = gs.getMessage('Choose the table that contains the recipients listed in event parm2');
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','event_parm_2_table');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}

function updateUsersHint(){
	var newHint = gs.getMessage('Choose recipients with a sys_id');
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','recipient_users');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}

function updateRecipientsInFieldsLabel(){
	var newlabel = gs.getMessage('Recipients listed in fields');
	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element','recipient_fields');
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element','recipient_fields');
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

function updateRecipientsInFieldsHint(){
	var newHint = gs.getMessage('Choose fields in the current table that list recipients you want to notify');
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','recipient_fields');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}
