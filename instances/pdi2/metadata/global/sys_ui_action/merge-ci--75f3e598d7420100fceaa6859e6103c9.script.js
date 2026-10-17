function merge_ci() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("merge_a_ci");
	dd.setTitle(new GwtMessage().getMessage("Merge CI : {0}", g_form.getValue('name')));
	dd.setPreference('sysparm_sys_id', gel('sys_uniqueValue').value);
	dd.setPreference('sysparm_class_name', g_form.getTableName());
	dd.setWidth(350);
	dd.render();
}
