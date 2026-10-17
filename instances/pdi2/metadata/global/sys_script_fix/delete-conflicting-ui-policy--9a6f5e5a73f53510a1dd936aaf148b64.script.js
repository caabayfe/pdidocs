/*
Delete UI Policy
- Log message when deletion of the UI Policy fails
*/
var uiPolicyGr = new GlideRecord('sys_ui_policy');
uiPolicyGr.addQuery('table', 'sys_sg_screen');
uiPolicyGr.addQuery('sys_id', '85d3760473231300b8d77a2f1bf6a72e');
uiPolicyGr.query();
if (uiPolicyGr.next()) {
	gs.info('Deleting UI policy: ' + uiPolicyGr.getValue('sys_id'));
	uiPolicyGr.deleteRecord();
} else {
	gs.warn('Unable to find UI Policy ' + uiPolicyGr.getValue('sys_id') + ' on sys_sg_screen table. ');
}

/*
Delete corresponding UI Policy Action
- Log message when deletion of the UI Policy Action fails
*/
var uiPolicyActionGr = new GlideRecord('sys_ui_policy_action');
uiPolicyActionGr.addQuery('ui_policy', '85d3760473231300b8d77a2f1bf6a72e');
uiPolicyActionGr.query();
if (uiPolicyActionGr.next()) {
	gs.info('Deleting UI policy Action: ' + uiPolicyActionGr.getValue('sys_id'));
	uiPolicyActionGr.deleteRecord();
} else {
	gs.warn('Unable to find UI Policy ' + uiPolicyActionGr.getValue('sys_id') + ' on sys_sg_screen table.');
}
