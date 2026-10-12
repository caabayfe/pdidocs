try {
	if (action !== undefined) {
		var param = action.get('sysparm_misc');
		var helper = new SNC.ReplaceWidgetPlaceholder();
		helper.replaceStub(param, current.sys_class_name, current.sys_id, current.name);
	}
} catch(e) {
	// Ignore
}
