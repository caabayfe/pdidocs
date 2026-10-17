/**
 *  Business rules on v_rotation table of 'when' type 'action_list_button', get converted to UI action on upgrade via a fix script. These needs to be deactivated.
 *  Set the active flag (to false) on UI actions which got converted from Business rules
 *  UI actions (previously Business rules) which are de-activated are:
 	- Edit Schedule
 	- Refresh Report
 	- Roster Properties
 */

deactivateUiActionsForRotation();

function deactivateUiActionsForRotation() {
	var gr = new GlideRecord("sys_ui_action");
	gr.addQuery("table", "=", "v_rotation");
	gr.addQuery("name", "IN", "Edit Schedule,Refresh Report,Roster Properties");
	gr.query();
	while (gr.next()) {
		gr.setValue("active", false);
		gr.update();
	}
}
