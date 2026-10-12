function openDialog(){
	var dialogWindow = new GlideModalForm(getMessage('New Parameter Value Set'), "sys_atf_parameter_set");
	dialogWindow.setSize(900);
	dialogWindow.addParm("sysparm_query", "test="+g_form.getUniqueValue());
	dialogWindow.setPreference("focusTrap", true);
	dialogWindow.setCompletionCallback(onClose);
	dialogWindow.render();	

}

function onClose() {
	// support list v2 and v3
	var listObj = (typeof g_list !== 'undefined') ? g_list : GlideList.get('sys_atf_test.sys_atf_step.test');
	listObj.refresh();
}
