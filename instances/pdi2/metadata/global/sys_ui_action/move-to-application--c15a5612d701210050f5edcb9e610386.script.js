	function addFileToAppFromForm() {
		var sysId = gel('sys_uniqueValue').value;
		var tableName = gel('sys_target').value;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var dd = new dialogClass("add_to_app_dialog");
		dd.setTitle(new GwtMessage().getMessage('Move to application'));
		dd.setPreference('sysparm_sys_source_id', sysId);
		dd.setPreference('sysparm_sys_table_name', tableName);
		dd.setWidth(400);
		dd.render();
	}
