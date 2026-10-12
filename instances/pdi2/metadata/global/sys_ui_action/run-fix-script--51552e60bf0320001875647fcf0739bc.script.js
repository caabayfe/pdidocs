function runFixScript() {
    var modalTitle = 'Run Fix Script';
    var msgMap = new GwtMessage().getMessages([modalTitle, 'Fix script {0} not found']);

	var sysId = typeof rowSysId == 'undefined' ? gel('sys_uniqueValue').value : rowSysId;
	var gr = new GlideRecord('sys_script_fix');
	gr.addQuery("sys_id", sysId);
	gr.query();
	if (gr.next()) {
          var dialog = new GlideModal("run_fix_script_modal", true, 400);
          dialog.setTitle(msgMap[modalTitle]);
          dialog.setPreference("sysparm_sys_id", gr.sys_id);
          dialog.setPreference("sysparm_script_name", gr.name);
          dialog.setPreference("focusTrap", true);
          dialog.render();
	} else
		alert(new GwtMessage().format(msgMap['Fix script {0} not found'], sysId));
}
