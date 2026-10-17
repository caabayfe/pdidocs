updateEventParmFieldHint();
function updateEventParmFieldHint() {
	if (pm.isZboot())
		return;
	updateIncludeOriginatorLabel();
	updateTriggeredByLabel();
	updateEventParm1FieldHint();
	updateEventParm2FieldHint();
}

function updateIncludeOriginatorLabel() {

	var newlabel = gs.getMessage('Include the person whose action triggered the notification');

	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element', 'include_originator');
	grUpdate.addQuery('label', '!=', newlabel);
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newlabel);
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element', 'include_originator');
	dictGr.addQuery('column_label', '!=', newlabel);
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}

function updateTriggeredByLabel() {

	var newlabel = gs.getMessage('Trigger');
	var newPlural = gs.getMessage('Triggers');

	var grUpdate = new GlideRecord('sys_documentation');
	grUpdate.addQuery('name', 'sys_notification');
	grUpdate.addQuery('element', 'triggered_by');
	grUpdate.addQuery('label', '!=', newlabel);
	grUpdate.query();
	if (grUpdate.next()) {
		grUpdate.setValue('label', newlabel);
		grUpdate.setValue('plural', newPlural);
		grUpdate.setWorkflow(false);
		grUpdate.update();
	}

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'sys_notification');
	dictGr.addQuery('element', 'triggered_by');
	dictGr.addQuery('column_label', '!=', newlabel);
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('column_label', newlabel);
		dictGr.setWorkflow(false);
		dictGr.update();
	}
}


function updateEventParm1FieldHint() {

	var newHint = gs.getMessage('Their sys_ids appear in a comma-separated list in event parm1');

	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','event_parm_1');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}

function updateEventParm2FieldHint() {

	var newHint = gs.getMessage('Their sys_ids appear in a comma-separated list in event parm2');
	
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','event_parm_2');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', newHint);
	doc.setWorkflow(false);
	doc.update();
}
