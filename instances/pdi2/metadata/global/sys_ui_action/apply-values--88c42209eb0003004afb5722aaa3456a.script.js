function validate() {
	// the user has selected multiple values from choice list
	if(typeof g_fieldName == 'undefined' || g_fieldName == null){
	   if(g_list.getChecked().indexOf(',') != -1) {
			var dialog = new GlideDialogWindow("glide_alert_standard");
			dialog.setTitle("Validation");
			dialog.setPreference('warning', false);
			dialog.setPreference('title', "Please select only one precision and coverage value");
			dialog.setPreference('focusTrap',true);
			dialog.render(); //Open the dialog
			return;
		}
	}	
	var sysId = (typeof g_fieldName == 'undefined' || g_fieldName == null) ? g_list.getChecked() : g_sysId;		
	promptUser(sysId);
}

function promptUser(sysId) {	
    var dialog = new GlideDialogWindow("glide_confirm_standard");
    dialog.setTitle("Precision / Coverage Setting");
    dialog.setPreference('warning', false);
    dialog.setPreference('title', getDialogTitle(sysId));
    dialog.setPreference('onPromptComplete', onPromptComplete);	
    dialog.setPreference('sysId', sysId);
    dialog.setPreference('focusTrap',true);
    dialog.render(); //Open the dialog
}

function getDialogTitle(sysId) {
	var newPcLookupRec = getRecForTable(sysId, "ml_pc_lookup");
	if (newPcLookupRec == null)
		return;
	var mlClassRec = getRecForTable(newPcLookupRec.class_name, "ml_class");
	if (mlClassRec == null)
		return;
	var oldPcLookupRec = getRecForTable(mlClassRec.pc_lookup, "ml_pc_lookup");
	if (oldPcLookupRec == null)
		return;
	
	var dialogTitle = "Do you want to change the precision (from ";
	dialogTitle += oldPcLookupRec.precision + " to " + newPcLookupRec.precision;
	dialogTitle += ") and coverage (from "
	dialogTitle += oldPcLookupRec.coverage + " to " + newPcLookupRec.coverage + ") ?";
	return dialogTitle;
}

function getRecForTable(sysId, tableName) {
	var record = new GlideRecord(tableName);
	record.addQuery("sys_id", sysId);
	record.query();
	if (record.next())
		return record;
	else
		return null;
}

function onPromptComplete(){
	var ga = new GlideAjax('ApplyPcLookup');
	ga.addParam('sysparm_name','applyPcLookup');
	ga.addParam('sysparm_sysId', this.getPreference('sysId'));
	ga.getXMLWait();
	g_navigation.openRecord('ml_class',g_form.getUniqueValue());
}

// Code that runs without the onclick
if(typeof window == 'undefined') {
	action.setRedirectURL(current);
}
